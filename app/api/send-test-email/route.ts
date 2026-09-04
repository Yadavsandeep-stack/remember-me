import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function getLocalDate(
  date: Date,
  timezone: string
) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getMonthDay(
  dateString: string
) {
  const date = new Date(`${dateString}T00:00:00Z`);

  return {
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function addDays(
  dateString: string,
  days: number
) {
  const date = new Date(`${dateString}T00:00:00Z`);

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  try {
    // --------------------------------
    // 1. Protect the cron endpoint
    // --------------------------------

    const authHeader =
      request.headers.get("authorization");

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------
    // 2. Get all enabled email reminders
    // --------------------------------

    const {
      data: reminders,
      error: reminderError,
    } = await supabase
      .from("reminders")
      .select(`
        id,
        user_id,
        person_id,
        days_before,
        send_email,
        enabled,
        people!inner (
          name,
          dob
        )
      `)
      .eq("enabled", true)
      .eq("send_email", true)
      .not("person_id", "is", null);

    if (reminderError) {
      return Response.json(
        {
          error: reminderError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!reminders || reminders.length === 0) {
      return Response.json({
        success: true,
        message: "No reminders to process.",
        sent: 0,
      });
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    // --------------------------------
    // 3. Process each reminder
    // --------------------------------

    for (const reminder of reminders) {
      const person = Array.isArray(reminder.people)
        ? reminder.people[0]
        : reminder.people;

      if (!person?.dob) {
        skipped++;
        continue;
      }

      // --------------------------------
      // 4. Get user's profile/timezone
      // --------------------------------

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", reminder.user_id)
        .maybeSingle();

      if (profileError) {
        failed++;
        continue;
      }

      const timezone =
        profile?.timezone || "Asia/Kolkata";

      // --------------------------------
      // 5. Get today's date in user's timezone
      // --------------------------------

      const today = getLocalDate(
        new Date(),
        timezone
      );

      // --------------------------------
      // 6. Calculate reminder target date
      //
      // Example:
      // Birthday = 10 September
      // days_before = 1
      //
      // Target reminder date:
      // 9 September
      // --------------------------------

      const targetDate = addDays(
        today,
        reminder.days_before
      );

      const targetMonthDay =
        getMonthDay(targetDate);

      const birthdayMonthDay =
        getMonthDay(person.dob);

      // --------------------------------
      // 7. Is the birthday coming up?
      // --------------------------------

      if (
        targetMonthDay.month !==
          birthdayMonthDay.month ||
        targetMonthDay.day !==
          birthdayMonthDay.day
      ) {
        skipped++;
        continue;
      }

      // --------------------------------
      // 8. Get user's email
      // --------------------------------

      const {
        data: authUser,
        error: authError,
      } =
        await supabase.auth.admin.getUserById(
          reminder.user_id
        );

      if (
        authError ||
        !authUser.user?.email
      ) {
        failed++;
        continue;
      }

      const userEmail =
        authUser.user.email;

      // --------------------------------
      // 9. Prevent duplicate emails
      // --------------------------------

      const {
        data: existingLog,
      } = await supabase
        .from("notification_logs")
        .select("id")
        .eq(
          "reminder_id",
          reminder.id
        )
        .eq(
          "scheduled_for",
          `${today}T00:00:00+00:00`
        )
        .maybeSingle();

      if (existingLog) {
        skipped++;
        continue;
      }

      // --------------------------------
      // 10. Create pending notification log
      // --------------------------------

      const {
        data: notification,
        error: logError,
      } =
        await supabase
          .from("notification_logs")
          .insert({
            user_id: reminder.user_id,
            reminder_id: reminder.id,
            person_id: reminder.person_id,
            scheduled_for:
              `${today}T00:00:00+00:00`,
            status: "pending",
          })
          .select()
          .single();

      if (logError) {
        failed++;
        continue;
      }

      // --------------------------------
      // 11. Send email
      // --------------------------------

      const { error: emailError } =
        await resend.emails.send({
          from:
            "RememberMe <onboarding@resend.dev>",

          to: [userEmail],

          subject:
            `🎂 ${person.name}'s birthday is coming up!`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
              "
            >

              <h1>
                RememberMe 🎂
              </h1>

              <p>
                Just a friendly reminder:
              </p>

              <h2>
                ${person.name}'s birthday
                is coming up!
              </h2>

              <p>
                Their birthday is
                <strong>
                  ${birthdayMonthDay.day}/${birthdayMonthDay.month}
                </strong>.
              </p>

              <p>
                Don't forget to wish them
                a happy birthday! 🎉
              </p>

              <hr />

              <p
                style="
                  color: #666;
                  font-size: 13px;
                "
              >
                This reminder was sent by
                RememberMe.
              </p>

            </div>
          `,
        });

      // --------------------------------
      // 12. Update notification log
      // --------------------------------

      if (emailError) {
        failed++;

        await supabase
          .from("notification_logs")
          .update({
            status: "failed",
            error_message:
              emailError.message,
          })
          .eq(
            "id",
            notification.id
          );

        continue;
      }

      await supabase
        .from("notification_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq(
          "id",
          notification.id
        );

      sent++;
    }

    // --------------------------------
    // 13. Return result
    // --------------------------------

    return Response.json({
      success: true,
      sent,
      skipped,
      failed,
    });

  } catch (error) {
    console.error(
      "Reminder cron error:",
      error
    );

    return Response.json(
      {
        error:
          "Something went wrong while processing reminders.",
      },
      {
        status: 500,
      }
    );
  }
}