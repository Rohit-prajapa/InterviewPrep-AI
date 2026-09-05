import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/profileService";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [editOpen, setEditOpen] = useState(false);

  const profile = user?.profile || {};
  const stats = user?.stats || {};

  const skills = Array.isArray(profile.skills)
    ? profile.skills
    : [];

  const name = user?.name || "User";
  const email = user?.email || "No email";
  const initial = name.charAt(0).toUpperCase();

  const targetRole = profile.targetRole || "Not set";
  const experience = profile.experience || "Fresher";

  const interviewsCompleted =
    stats.interviewsCompleted || 0;

  const questionsAnswered =
    stats.questionsAnswered || 0;

  const averageScore =
    stats.averageScore || 0;

  const streak = stats.streak || 0;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              ACCOUNT
            </p>

            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-slate-400">
              Manage your profile and track your interview progress.
            </p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* ================= PROFILE HERO ================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">

          <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold shadow-lg">
                  {initial}
                </div>

                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    {name}
                  </h2>

                  <p className="mt-1 text-slate-400">
                    {email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                      {user?.role || "Student"}
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      ● Active
                    </span>

                  </div>
                </div>

              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 px-5 py-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Target Role
                </p>

                <p className="mt-1 font-semibold text-white">
                  {targetRole}
                </p>

              </div>

            </div>
          </div>

          {/* ================= PROFILE DETAILS ================= */}

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

            <InfoCard
              icon="🎯"
              title="Target Role"
              value={targetRole}
            />

            <InfoCard
              icon="💼"
              title="Experience"
              value={experience}
            />

            <InfoCard
              icon="🎤"
              title="Interviews"
              value={interviewsCompleted}
            />

            <InfoCard
              icon="⭐"
              title="Average Score"
              value={`${Math.round(averageScore)}%`}
            />

          </div>
        </div>

        {/* ================= STATS ================= */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Your Progress
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your interview preparation activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ProgressCard
              title="Interviews Completed"
              value={interviewsCompleted}
              description="Mock interviews completed"
              icon="🎤"
            />

            <ProgressCard
              title="Questions Answered"
              value={questionsAnswered}
              description="AI interview questions answered"
              icon="💬"
            />

            <ProgressCard
              title="Practice Streak"
              value={`${streak} days`}
              description="Keep your momentum going"
              icon="🔥"
            />

          </div>
        </section>

        {/* ================= SKILLS ================= */}

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Technical Skills
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Skills used for personalized interview preparation.
              </p>
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              + Manage Skills
            </button>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center">

                <p className="text-slate-500">
                  No skills added yet.
                </p>

                <button
                  onClick={() => setEditOpen(true)}
                  className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Add your skills
                </button>

              </div>
            )}

          </div>
        </section>

        {/* ================= PROFILE COMPLETION ================= */}

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Profile Completion
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Complete your profile for better personalization.
              </p>
            </div>

            <span className="text-xl font-bold text-blue-400">
              {calculateCompletion(user)}%
            </span>

          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{
                width: `${calculateCompletion(user)}%`,
              }}
            />

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <CompletionItem
              label="Basic Information"
              complete={Boolean(user?.name && user?.email)}
            />

            <CompletionItem
              label="Target Role"
              complete={Boolean(profile.targetRole)}
            />

            <CompletionItem
              label="Experience"
              complete={Boolean(profile.experience)}
            />

            <CompletionItem
              label="Skills"
              complete={skills.length > 0}
            />

          </div>
        </section>

        {/* ================= ACCOUNT INFORMATION ================= */}

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <h2 className="text-xl font-bold">
            Account Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <DetailRow
              label="Name"
              value={name}
            />

            <DetailRow
              label="Email"
              value={email}
            />

            <DetailRow
              label="Account Type"
              value={user?.role || "Student"}
            />

            <DetailRow
              label="Experience Level"
              value={experience}
            />

          </div>
        </section>

      </div>

      {/* ================= EDIT MODAL ================= */}

      {editOpen && (
        <EditProfileModal
          user={user}
          setUser={setUser}
          onClose={() => setEditOpen(false)}
        />
      )}

    </div>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-700">

      <div className="flex items-center gap-3">

        <span className="text-xl">
          {icon}
        </span>

        <p className="text-sm text-slate-400">
          {title}
        </p>

      </div>

      <p className="mt-3 truncate text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   PROGRESS CARD
===================================================== */

function ProgressCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/10 p-3 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =====================================================
   COMPLETION ITEM
===================================================== */

function CompletionItem({ label, complete }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3">

      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
          complete
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {complete ? "✓" : "○"}
      </span>

      <span
        className={`text-sm ${
          complete
            ? "text-slate-200"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

/* =====================================================
   DETAIL ROW
===================================================== */

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-4">

      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-medium text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   EDIT PROFILE MODAL
===================================================== */

function EditProfileModal({
  user,
  setUser,
  onClose,
}) {
  const profile = user?.profile || {};

  const [name, setName] = useState(
    user?.name || ""
  );

  const [targetRole, setTargetRole] = useState(
    profile.targetRole || ""
  );

  const [experience, setExperience] = useState(
    profile.experience || "fresher"
  );

  const [skills, setSkills] = useState(
    Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (name.trim().length < 2) {
      setError(
        "Name must be at least 2 characters."
      );
      return;
    }

    if (name.trim().length > 50) {
      setError(
        "Name cannot exceed 50 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await updateProfile({
        name: name.trim(),
        targetRole: targetRole.trim(),
        experience,
        skills: skillsArray,
      });

      if (!response?.user) {
        throw new Error(
          "Invalid response from server."
        );
      }

      setUser(response.user);

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-blue-400">
              PROFILE SETTINGS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Edit Profile
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >

          <Input
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="Enter your name"
          />

          <Input
            label="Target Role"
            value={targetRole}
            onChange={setTargetRole}
            placeholder="e.g. Full Stack Developer"
          />

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Experience Level
            </label>

            <select
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="fresher">
                Fresher
              </option>

              <option value="0-1 years">
                0-1 Years
              </option>

              <option value="1-2 years">
                1-2 Years
              </option>

              <option value="2-5 years">
                2-5 Years
              </option>

              <option value="5+ years">
                5+ Years
              </option>
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Skills
            </label>

            <textarea
              value={skills}
              onChange={(event) =>
                setSkills(event.target.value)
              }
              rows={4}
              placeholder="Java, JavaScript, React, Node.js, MongoDB"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate skills using commas.
            </p>

          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

/* =====================================================
   INPUT
===================================================== */

function Input({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
      />

    </div>
  );
}

/* =====================================================
   PROFILE COMPLETION
===================================================== */

function calculateCompletion(user) {
  if (!user) return 0;

  const profile = user.profile || {};

  let completed = 0;

  if (user.name) completed += 25;

  if (user.email) completed += 25;

  if (profile.targetRole) completed += 25;

  if (
    profile.experience ||
    (Array.isArray(profile.skills) &&
      profile.skills.length > 0)
  ) {
    completed += 25;
  }

  return completed;
}