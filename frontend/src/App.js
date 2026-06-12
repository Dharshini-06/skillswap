import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Onboarding from "./pages/onboarding";
import MainDashboard from "./pages/MainDashboard";
import Profile from "./pages/Profile";
import { ProtectedRoute, PublicRoute } from "./components/Guard";

import MySkills from "./pages/MySkills";
import SkillSwapRequests from "./pages/SkillSwapRequests";
import SwapProgressTracker from "./pages/SwapProgressTracker";
import LearningFeed from "./pages/LearningFeed";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import VideoCall from "./components/VideoCall";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-skills"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <MySkills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-swap-requests"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <SkillSwapRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/swap-progress"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <SwapProgressTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-feed"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <LearningFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <MainDashboard showMessagesModal={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/session/:userId"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-call/:swapId"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <VideoCall />
            </ProtectedRoute>
          }
        />


      </Routes>
    </Router>
  );
}

export default App;

