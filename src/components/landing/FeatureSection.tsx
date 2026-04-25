const features = [
  {
    title: "Gender-aware game list",
    body: "Your dashboard surfaces events that match your profile — the same structure described for student sign-up and game selection.",
  },
  {
    title: "Slots & registration",
    body: "Each game has a fixed capacity. When slots fill up, registration closes automatically so nobody joins an over-full draw.",
  },
  {
    title: "Team manager workflow",
    body: "After you register, requests can be confirmed by your department team manager — accept or reject with status updates to availability.",
  },
  {
    title: "Rules, venue & contacts",
    body: "Per-game rules, venue, and office-style contact details for team managers — aligned with the information students need for Sports Week.",
  },
  {
    title: "Reports & results",
    body: "Sidebar access to rules and regulations, committee information, game managers, and results as your implementation grows.",
  },
  {
    title: "Stats & departments",
    body: "Planned admin and student views for charts: how departments compare overall and by sport, as required for the FYP deliverable.",
  },
];

export function FeatureSection() {
  return (
    <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              How the platform works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The platform guides users from secure sign-in to event registration, with
              role-based tools for students and administrators to manage participation,
              updates, and visibility in one place.
            </p>
            <ul className="mt-8 space-y-3 text-slate-600">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-amber-500" />
                <span>Authentication for student accounts and role-based access for staff.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-amber-500" />
                <span>Admin tools to add, edit, or remove games and users, with system-wide registration insight.</span>
              </li>
            </ul>
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
              >
                <h3 className="font-heading text-base font-semibold text-brand-900">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
