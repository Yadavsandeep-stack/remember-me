import { BrevoClient } from "@getbrevo/brevo";
import { createClient } from "@supabase/supabase-js";

type Reminder = {
  id: string;
  user_id: string;
  person_id: string | null;
  event_id: string | null;
  days_before: number;
};

type Event = {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  description: string | null;
};

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getToday(timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
}

function hasSameMonthAndDay(firstDate: string, secondDate: string) {
  return firstDate.slice(5) === secondDate.slice(5);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

function isEventDue(event: Event, dueDate: string) {
  return event.is_recurring
    ? hasSameMonthAndDay(event.event_date, dueDate)
    : event.event_date === dueDate;
}

function getEventOccurrence(event: Event, dueDate: string) {
  return event.is_recurring
    ? `${dueDate.slice(0, 4)}-${event.event_date.slice(5)}`
    : event.event_date;
}

async function markNotification(
  notificationLogId: string,
  status: "sent" | "failed",
  errorMessage?: string
) {
  const update = {
    status,
    sent_at: status === "sent" ? new Date().toISOString() : null,
    error_message: errorMessage ?? null,
  };

  return supabase
    .from("notification_logs")
    .update(update)
    .eq("id", notificationLogId);
}

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: reminders, error: reminderError } = await supabase
      .from("reminders")
      .select("id, user_id, person_id, event_id, days_before")
      .eq("enabled", true)
      .eq("send_email", true);

    if (reminderError) {
      console.error("Unable to load reminders", reminderError.message);
      return Response.json({ error: "Unable to load reminders." }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const reminder of (reminders ?? []) as Reminder[]) {
      if (!reminder.person_id) {
        skipped++;
        continue;
      }

      const { data: person, error: personError } = await supabase
        .from("people")
        .select("id, name, dob")
        .eq("id", reminder.person_id)
        .eq("user_id", reminder.user_id)
        .maybeSingle();

      if (personError || !person) {
        failed++;
        continue;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", reminder.user_id)
        .maybeSingle();

      const dueDate = addDays(getToday(profile?.timezone ?? "UTC"), reminder.days_before);
      let event: Event | null = null;
      let notificationTitle = "Birthday";
      let isDue = false;

      if (reminder.event_id) {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, title, event_type, event_date, is_recurring, description")
          .eq("id", reminder.event_id)
          .eq("person_id", reminder.person_id)
          .eq("user_id", reminder.user_id)
          .maybeSingle();

        if (eventError || !eventData) {
          failed++;
          continue;
        }

        event = eventData as Event;
        notificationTitle = event.title;
        isDue = isEventDue(event, dueDate);
      } else {
        isDue = Boolean(person.dob && hasSameMonthAndDay(person.dob, dueDate));
      }

      if (!isDue) {
        skipped++;
        continue;
      }

      const scheduledFor = `${dueDate}T00:00:00.000Z`;
      const { data: notificationLogId, error: claimError } = await supabase.rpc(
        "claim_reminder_notification",
        {
          p_reminder_id: reminder.id,
          p_user_id: reminder.user_id,
          p_person_id: reminder.person_id,
          p_event_id: event?.id ?? null,
          p_scheduled_for: scheduledFor,
        }
      );

      if (claimError) {
        console.error("Unable to claim reminder notification", claimError.message);
        failed++;
        continue;
      }

      if (!notificationLogId) {
        skipped++;
        continue;
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.getUserById(reminder.user_id);

      if (authError || !authData.user?.email) {
        await markNotification(notificationLogId, "failed", "Unable to find recipient email.");
        failed++;
        continue;
      }

      const eventDescription = event?.description
        ? `<p style="margin: 16px 0 0; color: #52525b;">${escapeHtml(event.description)}</p>`
        : "";
      const importantDate = event
        ? getEventOccurrence(event, dueDate)
        : person.dob ?? dueDate;

      try {
        await brevo.transactionalEmails.sendTransacEmail({
          sender: {
            name: "RememberMe",
            email: "sandeepy.cs.24@nitj.ac.in",
          },
          to: [{ email: authData.user.email }],
          subject: `${notificationTitle} reminder for ${person.name}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #18181b;">
              <h1 style="margin: 0 0 20px;">RememberMe</h1>
              <h2 style="margin: 0 0 12px;">${escapeHtml(notificationTitle)} is coming up</h2>
              <p style="margin: 0;">${escapeHtml(person.name)} has an important date on ${escapeHtml(importantDate)}.</p>
              ${eventDescription}
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px;">You received this email because you enabled a reminder in RememberMe.</p>
            </div>
          `,
        });

        const { error: logError } = await markNotification(notificationLogId, "sent");
        if (logError) {
          console.error("Unable to mark reminder as sent", logError.message);
          failed++;
          continue;
        }

        sent++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Brevo email failed";
        await markNotification(notificationLogId, "failed", errorMessage.slice(0, 500));
        failed++;
      }
    }

    return Response.json({
      success: true,
      checked: reminders?.length ?? 0,
      sent,
      skipped,
      failed,
    });
  } catch (error: unknown) {
    console.error("Cron execution failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
