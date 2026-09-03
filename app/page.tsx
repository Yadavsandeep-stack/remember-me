import { Bell, CalendarDays, Gift, ShieldCheck ,} from "lucide-react"
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5 justify-between">
          <div className="flex items-center gap-4">
            Remember Me
          </div>
          <div className="flex gap-3">
            <a href="/login" className = "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              Login
            </a>
            <a href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            Get Started
            </a>
          </div>
        </div>
      </nav>
      

      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm">
          <Bell className="h-4 w-4" />
          Never miss an important date
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Remember the people
        <br/>
        who matter.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Keep birthdays, anniversaries and important dates organized.
          RememberMe sends you a reminder before the day arrives.
          </p>
          <div className="mt-8 flex justify-center gap-4">

     <a
            href="/register"
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            Start for Free
          </a>

          <a
            href="/login"
            className="rounded-md border px-6 py-3 font-medium"
          >
            Login
          </a>
        </div>
      </section>
       <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        <Feature
          icon={<Gift />}
          title="Birthdays"
          description="Store birthdays and never forget someone special."
        />

        <Feature
          icon={<CalendarDays />}
          title="Important dates"
          description="Manage anniversaries and custom events in one place."
        />

        <Feature
          icon={<ShieldCheck />}
          title="Private"
          description="Your personal information stays protected."
        />
      </section>

    </main>
  );
}

function Feature({
  icon,title,description,}:{
    icon:React.ReactNode;
    title:string;
    description:string;
  }){
    return (
    <div className="rounded-xl border p-6">
      <div className="mb-4 w-fit rounded-lg bg-muted p-3">
        {icon}
      </div>

      <h2 className="mb-2 text-xl font-semibold">
        {title}
      </h2>

      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}