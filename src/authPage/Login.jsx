import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import LoginPanel from "./LoginPanel"
import ForgotPassword from "./forgotPassword/ForgotPassword"

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ shouldUnregister: true })

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let endpoint = "";
      switch (selectedRole) {
        case "student":
        case "tutor":
        case "admin":
          endpoint = `${API_URL}/auth/login`;
          break;
        default:
          throw new Error("Please select a role");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: selectedRole,
          rememberMe, // Send Remember Me value
        }),
      });

      const result = await response.json();

      if (result.success) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              token: result.token,
              cohort: result.currentCohort,
              position: selectedRole,
              ...result.data,
            })
          );

        toast.success("Login successful!");

        // Redirect based on role
        switch (selectedRole) {
          case "student":
            navigate("/student-dash");
            break;
          case "tutor":
            navigate("/teacher-dash");
            break;
          case "admin":
            navigate("/admin-dash");
            break;
        }
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <LoginPanel
      selectedRole={selectedRole} setSelectedRole={setSelectedRole}
      showPassword={showPassword} setShowPassword={setShowPassword}
      isLoading={isLoading} rememberMe={rememberMe} setRememberMe={setRememberMe}
      register={register} errors={errors} onSubmit={handleSubmit(onSubmit)}
      onForgotPassword={() => setShowForgotPassword(true)}
    >
      <ForgotPassword isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} role={selectedRole} />
    </LoginPanel>
  )
}
