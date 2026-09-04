export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-6 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} InterviewPrep AI. All rights reserved.
    </footer>
  );
}