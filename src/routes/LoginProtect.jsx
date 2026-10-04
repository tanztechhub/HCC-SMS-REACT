import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginProtect = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        // Redirect based on position
        if (user) {
            if (user.position === "student") {
                navigate("/student-dash");
            } else if (user.position === "tutor") {
                navigate("/teacher-dash");
            } else if (user.position === "admin") {
                navigate("/admin-dash");
            }
        }
    }, [navigate, user]);

    return children;
};

export default LoginProtect;
