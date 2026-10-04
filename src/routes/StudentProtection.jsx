import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const StudentProtection = ({ children }) => {
  let user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
    toast.error("Your session has expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  // If tutorId is empty, reduce token duration to 24 hours
  if (!user.tutorId) {
    if (user.tokenDuration > 1) { 
      user.tokenDuration = 1; 
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  // Check token expiration
  const currentTime = Date.now();
  const tokenExpiryTime = user.loginTimestamp + user.tokenDuration * 24 * 60 * 60 * 1000;

  if (currentTime > tokenExpiryTime) {
    localStorage.removeItem("user");
    toast.error("Your session has expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StudentProtection;
