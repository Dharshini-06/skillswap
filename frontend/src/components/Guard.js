import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children, requireOnboarding = true }) => {
    const location = useLocation();
    const userId = localStorage.getItem("userId");
    const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";

    if (!userId) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (requireOnboarding && !onboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
    }

    if (!requireOnboarding && onboardingCompleted) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const userId = localStorage.getItem("userId");
    const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";

    if (userId) {
        if (onboardingCompleted) {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return children;
};
