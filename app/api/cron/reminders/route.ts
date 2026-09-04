import { createClient } from "@supabase/supabase-js";
import * as brevo from "@getbrevo/brevo";

// =========================================================
// BREVO CLIENT
// =========================================================

const brevoClient = new brevo.TransactionalEmailsApi();

brevoClient.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

// =========================================================
// SUPABASE ADMIN CLIENT
// =========================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =========================================================
// GET TODAY IN USER'S TIMEZONE
// =========================================================

function getToday(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// =========================================================
// GET MONTH + DAY FROM YYYY-MM-DD
// =========================================================

function getMonthDay(dateString: string) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return {
    month,
    day,
  };
}

// =========================================================
// ADD DAYS TO DATE
// =========================================================

function addDays(dateString: string, days: number) {
  const date = new Date(
    `${dateString}T00:00:00Z`
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .split("T")[0];
}

// =========================================================
// CRON GET REQUEST
// =========================================================

export async function GET(request: Request) {
  console.log("=================================");
  console.log("CRON: started");
  console.log("=================================");

  try {
    // =====================================================
    // 1. CHECK CRON SECRET
    // =====================================================

    const authHeader =
      request.headers.get("authorization");

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.log(
        "CRON: unauthorized"
      );

      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "CRON: authorized"
    );

    // =====================================================
    // 2. GET ENABLED EMAIL REMINDERS
    // =====================================================

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
          error:
            reminderError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "CRON: reminders found:",
      reminders?.length ?? 0
    );

    // =====================================================
    // NO REMINDERS
    // =====================================================

    if (
      !reminders ||
      reminders.length === 0
    ) {
      console.log(
        "CRON: no reminders found"
      );

      return Response.json({
        success: true,
        message:
          "No enabled reminders found.",
        sent: 0,
        skipped: 0,
        failed: 0,
      });
    }

    // =====================================================
    // COUNTERS
    // =====================================================

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    // =====================================================
    // 3. PROCESS EACH REMINDER
    // =====================================================

    for (const reminder of reminders) {
      console.log(
        "---------------------------------"
      );

      console.log(
        "Processing reminder:",
        reminder.id
      );

      // ===================================================
      // CHECK PERSON ID
      // ===================================================

      if (!reminder.person_id) {
        console.log(
          "No person_id. Skipping."
        );

        skipped++;
        continue;
      }

      // ===================================================
      // 4. GET PERSON
      // ===================================================

      const {
        data: person,
        error: personError,
      } = await supabase
        .from("people")
        .select(
          "id, name, dob"
        )
        .eq(
          "id",
          reminder.person_id
        )
        .eq(
          "user_id",
          reminder.user_id
        )
        .maybeSingle();

      if (personError) {
        console.error(
          "Person query error:",
          personError
        );

        failed++;
        continue;
      }

      // ===================================================
      // PERSON NOT FOUND
      // ===================================================

      if (
        !person ||
        !person.dob
      ) {
        console.log(
          "No person or DOB found."
        );

        skipped++;
        continue;
      }

      console.log(
        "Person:",
        person.name
      );

      console.log(
        "DOB:",
        person.dob
      );

      // ===================================================
      // 5. GET USER TIMEZONE
      // ===================================================

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("timezone")
        .eq(
          "id",
          reminder.user_id
        )
        .maybeSingle();

      if (profileError) {
        console.log(
          "Profile query error:",
          profileError
        );
      }

      const timezone =
        profile?.timezone ||
        "Asia/Kolkata";

      console.log(
        "Timezone:",
        timezone
      );

      // ===================================================
      // 6. GET TODAY
      // ===================================================

      const today =
        getToday(timezone);

      console.log(
        "Today:",
        today
      );

      console.log(
        "Days before:",
        reminder.days_before
      );

      // ===================================================
      // 7. CALCULATE TARGET DATE
      // ===================================================

      const targetDate =
        addDays(
          today,
          reminder.days_before
        );

      console.log(
        "Target date:",
        targetDate
      );

      // ===================================================
      // 8. GET MONTH + DAY
      // ===================================================

      const targetMonthDay =
        getMonthDay(
          targetDate
        );

      const birthdayMonthDay =
        getMonthDay(
          person.dob
        );

      console.log(
        "Target month/day:",
        targetMonthDay
      );

      console.log(
        "Birthday month/day:",
        birthdayMonthDay
      );

      // ===================================================
      // 9. CHECK IF BIRTHDAY MATCHES
      // ===================================================

      if (
        targetMonthDay.month !==
          birthdayMonthDay.month ||
        targetMonthDay.day !==
          birthdayMonthDay.day
      ) {
        console.log(
          "Birthday does not match."
        );

        skipped++;
        continue;
      }

      console.log(
        "🎂 BIRTHDAY MATCH FOUND!"
      );

      // ===================================================
      // 10. GET USER EMAIL
      // ===================================================

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

      const userEmail =
        authData.user.email;

      console.log(
        "Sending email to:",
        userEmail
      );

      // ===================================================
      // 11. CREATE BREVO EMAIL
      // ===================================================

      try {
        const sendSmtpEmail =
          new brevo.SendSmtpEmail();

        // -------------------------------------------------
        // SENDER
        // -------------------------------------------------

        sendSmtpEmail.sender = {
          name: "RememberMe",
          email:
            "sandeepy.cs.24@nitj.ac.in",
        };

        // -------------------------------------------------
        // RECIPIENT
        // -------------------------------------------------

        sendSmtpEmail.to = [
          {
            email: userEmail,
          },
        ];

        // -------------------------------------------------
        // SUBJECT
        // -------------------------------------------------

        sendSmtpEmail.subject =
          `🎂 ${person.name}'s birthday is coming up!`;

        // -------------------------------------------------
        // EMAIL HTML
        // -------------------------------------------------

        sendSmtpEmail.htmlContent = `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background: #ffffff;
              color: #222222;
            "
          >

            <h1>
              RememberMe 🎂
            </h1>

            <h2>
              ${person.name}'s birthday
              is coming up!
            </h2>

            <p>
              This is your reminder from
              <strong>RememberMe</strong>.
            </p>

            <p>
              Don't forget to wish
              <strong>${person.name}</strong>
              a happy birthday! 🎉
            </p>

            <hr />

            <p
              style="
                color: #777777;
                font-size: 14px;
              "
            >
              You received this email because
              you created a birthday reminder
              in RememberMe.
            </p>

          </div>
        `;

        // =================================================
        // 12. SEND EMAIL THROUGH BREVO
        // =================================================

        const emailData =
          await brevoClient.sendTransacEmail(
            sendSmtpEmail
          );

        console.log(
          "EMAIL SENT SUCCESSFULLY:"
        );

        console.log(
          emailData
        );

        // =================================================
        // 13. SAVE SUCCESS LOG
        // =================================================

        const {
          error: logError,
        } = await supabase
          .from("notification_logs")
          .insert({
            user_id:
              reminder.user_id,

            reminder_id:
              reminder.id,

            person_id:
              reminder.person_id,

            scheduled_for:
              new Date().toISOString(),

            sent_at:
              new Date().toISOString(),

            status: "sent",
          });

        if (logError) {
          console.error(
            "Notification log error:",
            logError
          );
        }

        sent++;

      } catch (emailError: any) {

        // =================================================
        // 14. BREVO EMAIL FAILED
        // =================================================

        console.error(
          "Brevo email error:",
          emailError
        );

        failed++;

        // =================================================
        // SAVE FAILED LOG
        // =================================================

        const {
          error: logError,
        } = await supabase
          .from("notification_logs")
          .insert({
            user_id:
              reminder.user_id,

            reminder_id:
              reminder.id,

            person_id:
              reminder.person_id,

            scheduled_for:
              new Date().toISOString(),

            status: "failed",

            error_message:
              emailError?.message ||
              "Brevo email failed",
          });

        if (logError) {
          console.error(
            "Failed notification log error:",
            logError
          );
        }

        continue;
      }
    }

    // =====================================================
    // 15. FINAL RESULT
    // =====================================================

    console.log(
      "================================="
    );

    console.log(
      `CRON FINISHED: sent=${sent}, skipped=${skipped}, failed=${failed}`
    );

    console.log(
      "================================="
    );

    return Response.json({
      success: true,
      sent,
      skipped,
      failed,
    });

  } catch (error) {

    // =====================================================
    // GLOBAL ERROR
    // =====================================================

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