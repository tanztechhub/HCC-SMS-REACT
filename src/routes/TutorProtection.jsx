import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import PasswordModal from "./PasswordModal";

const TutorProtection = ({ children, requirePass }) => {
  const location = useLocation();
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(!!requirePass);

  // On route change, if this route requires a password, reset verification
  useEffect(() => {
    if (requirePass) {
      // Reset the verification state on every navigation to a route that requires a password
      setPasswordVerified(false);
      setShowPasswordModal(true);
      sessionStorage.removeItem(`route_${location.pathname}_verified`);
    }
  }, [location.pathname, requirePass]);

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  // Check token expiration
  const currentTime = Date.now();
  const tokenExpiryTime =
    user.loginTimestamp + user.tokenDuration * 24 * 60 * 60 * 1000;

  if (currentTime > tokenExpiryTime) {
    localStorage.removeItem("user");
    toast.error("Your session has expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  // Handler for successful password verification
  const handlePasswordSuccess = () => {
    setPasswordVerified(true);
    setShowPasswordModal(false);
    // Optional: store in sessionStorage to avoid re-verification for the same route
    sessionStorage.setItem(`route_${location.pathname}_verified`, "true");
  };

  // If password is required and not yet verified, check sessionStorage
  if (requirePass && !passwordVerified) {
    const isRouteVerified =
      sessionStorage.getItem(`route_${location.pathname}_verified`) === "true";

    if (isRouteVerified) {
      return children;
    }

    return (
      <>
        {children}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            // Navigate back if modal is closed without verification
            window.history.back();
          }}
          onSuccess={handlePasswordSuccess}
        />
      </>
    );
  }

  // If no password is required or it has been verified
  return children;
};

export default TutorProtection;
