import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function getToday(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getMonthDay(dateString: string) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return {
    month,
    day,
  };
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  console.log("CRON: started");

  try {
    // --------------------------------
    // 1. Check secret
    // --------------------------------

    const authHeader =
      request.headers.get("authorization");

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.log("CRON: unauthorized");

      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("CRON: authorized");

    // --------------------------------
    // 2. Get reminders
    // --------------------------------

    const {
      data: reminders,
      error: reminderError,
    } = await supabase
      .from("reminders")
      .select("*")
      .eq("enabled", true)
      .eq("send_email", true);

    if (reminderError) {
      console.error(
        "Reminder query error:",
        reminderError
      );

      return Response.json(
        {
          error: reminderError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "CRON: reminders found:",
      reminders?.length ?? 0
    );

    if (!reminders || reminders.length === 0) {
      return Response.json({
        success: true,
        message: "No enabled reminders found.",
        sent: 0,
      });
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    // --------------------------------
    // 3. Process reminders
    // --------------------------------

    for (const reminder of reminders) {
      console.log(
        "Processing reminder:",
        reminder.id
      );

      // --------------------------------
      // Get person separately
      // --------------------------------

      if (!reminder.person_id) {
        skipped++;
        continue;
      }

      const {
        data: person,
        error: personError,
      } = await supabase
        .from("people")
        .select("id, name, dob")
        .eq("id", reminder.person_id)
        .eq("user_id", reminder.user_id)
        .maybeSingle();

      if (personError) {
        console.error(
          "Person query error:",
          personError
        );

        failed++;
        continue;
      }

      if (!person || !person.dob) {
        console.log(
          "No person/DOB found"
        );

        skipped++;
        continue;
      }

      // --------------------------------
      // Get profile/timezone
      // --------------------------------

      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", reminder.user_id)
        .maybeSingle();

      const timezone =
        profile?.timezone || "Asia/Kolkata";

      // --------------------------------
      // Today's date
      // --------------------------------

      const today = getToday(timezone);

      console.log(
        "Today:",
        today,
        "Birthday:",
        person.dob,
        "Days before:",
        reminder.days_before
      );

      // --------------------------------
      // Calculate birthday date
      // --------------------------------

      const targetDate = addDays(
        today,
        reminder.days_before
      );

      const targetMonthDay =
        getMonthDay(targetDate);

      const birthdayMonthDay =
        getMonthDay(person.dob);

      console.log(
        "Target:",
        targetDate,
        "Target month/day:",
        targetMonthDay,
        "Birthday month/day:",
        birthdayMonthDay
      );

      // --------------------------------
      // Check birthday
      // --------------------------------

      if (
        targetMonthDay.month !==
          birthdayMonthDay.month ||
        targetMonthDay.day !==
          birthdayMonthDay.day
      ) {
        console.log(
          "Birthday does not match. Skipping."
        );

        skipped++;
        continue;
      }

      console.log(
        "BIRTHDAY MATCH FOUND!"
      );

      // --------------------------------
      // Get user's email
      // --------------------------------

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.admin.getUserById(
          reminder.user_id
        );

      if (
        authError ||
        !authData.user?.email
      ) {
        console.error(
          "User email error:",
          authError
        );

        failed++;
        continue;
      }

const userEmail = authData.user.email;
      console.log(
        "Sending email to:",
        userEmail
      );

      // --------------------------------
      // Send email
      // --------------------------------

      const {
        data: emailData,
        error: emailError,
      } = await resend.emails.send({
        from:
          "RememberMe <onboarding@resend.dev>",

        to: [userEmail],

        subject:
          `🎂 ${person.name}'s birthday is tomorrow!`,

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
            "
          >

            <h1>RememberMe 🎂</h1>

            <h2>
              ${person.name}'s birthday
              is coming up!
            </h2>

            <p>
              This is your reminder from
              RememberMe.
            </p>

            <p>
              Don't forget to wish
              <strong>${person.name}</strong>
              a happy birthday! 🎉
            </p>

          </div>
        `,
      });

      // --------------------------------
      // Email failed
      // --------------------------------

      if (emailError) {
        console.error(
          "Resend error:",
          emailError
        );

        failed++;

        await supabase
          .from("notification_logs")
          .insert({
            user_id: reminder.user_id,
            reminder_id: reminder.id,
            person_id: reminder.person_id,
            scheduled_for:
              new Date().toISOString(),
            status: "failed",
            error_message:
              emailError.message,
          });

        continue;
      }

      // --------------------------------
      // Email successful
      // --------------------------------

      console.log(
        "EMAIL SENT:",
        emailData?.id
      );

      await supabase
        .from("notification_logs")
        .insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          person_id: reminder.person_id,
          scheduled_for:
            new Date().toISOString(),
          sent_at:
            new Date().toISOString(),
          status: "sent",
        });

      sent++;
    }

    // --------------------------------
    // Final result
    // --------------------------------

    console.log(
      `CRON FINISHED: sent=${sent}, skipped=${skipped}, failed=${failed}`
    );

    return Response.json({
      success: true,
      sent,
      skipped,
      failed,
    });

  } catch (error) {
    console.error(
      "CRON ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}