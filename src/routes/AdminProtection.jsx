import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchJuniorPermissions } from "../store/permissionsSlice";
import { ALWAYS_ALLOWED_TAB_KEYS } from "../config/adminNavConfig";

// `tabKey` should match a key in src/config/adminNavConfig.jsx and is only
// needed on routes shared between senior/junior - it lets a Senior Admin
// restrict which of those a Junior Admin can open. Senior Admins are always
// unrestricted; routes with allowedRoles={["senior"]} don't need a tabKey
// since Junior Admins never pass the role check above anyway.
const AdminProtection = ({ children, allowedRoles, tabKey }) => {
  const dispatch = useDispatch();
  const { juniorAllowedTabs, status } = useSelector((state) => state.permissions);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  useEffect(() => {
    if (role === "junior" && status === "idle") {
      dispatch(fetchJuniorPermissions());
    }
  }, [dispatch, role, status]);

  if (!user || !user.token) {
    toast.error("Your session has expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  // Check token expiration
  const currentTime = Date.now();
  const tokenExpiryTime = user.loginTimestamp + user.tokenDuration * 24 * 60 * 60 * 1000;

  if (currentTime > tokenExpiryTime) {
    localStorage.removeItem("user");
    toast.error("Your session has expired. Please log in again.");
    window.history.back();
    return null;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    toast.error("You are not allowed to access this route.");
    return <Navigate to="/admin-dash" replace />;
  }

  // Junior Admins are additionally gated per-tab by settings a Senior Admin
  // controls. While the settings are still loading, wait rather than
  // wrongly denying access on a fresh page load.
  if (user.role === "junior" && tabKey && !ALWAYS_ALLOWED_TAB_KEYS.includes(tabKey)) {
    if (status === "idle" || status === "loading") {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-900"></div>
        </div>
      );
    }

    if (status === "succeeded" && !juniorAllowedTabs.includes(tabKey)) {
      toast.error("You are not allowed to access this tab.");
      return <Navigate to="/admin-dash" replace />;
    }
  }

  return children;
};

export default AdminProtection;
