import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        toast.error("You are not allowed to access this route.");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
