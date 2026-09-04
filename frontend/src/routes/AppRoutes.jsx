import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import Dashboard from "../pages/Dashboard";
import InterviewSetup from "../pages/InterviewSetup";
import LiveInterview from "../pages/LiveInterview";
import InterviewResult from "../pages/InterviewResult";
import InterviewHistory from "../pages/InterviewHistory";
import Questions from "../pages/Questions";
import Analytics from "../pages/Analytics";
import PreparationPlan from "../pages/PreparationPlan";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/live" element={<LiveInterview />} />
          <Route path="/interview/:id/result" element={<InterviewResult />} />
          <Route path="/interviews" element={<InterviewHistory />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/preparation-plan" element={<PreparationPlan />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}