import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const skills = user?.profile?.skills || [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Profile</h1>

        <p className="mt-2 text-slate-400">
          Your InterviewPrep AI profile.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {user?.name || "User"}
              </h2>

              <p className="text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <InfoCard
              title="Target Role"
              value={user?.profile?.targetRole || "Not set"}
            />

            <InfoCard
              title="Experience"
              value={user?.profile?.experience || "Fresher"}
            />

            <InfoCard
              title="Account Role"
              value={user?.role || "Student"}
            />

            <InfoCard
              title="Interviews Completed"
              value={user?.stats?.interviewsCompleted || 0}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Skills</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No skills added.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-800 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}