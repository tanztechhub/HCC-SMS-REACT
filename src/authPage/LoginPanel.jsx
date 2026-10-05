import { Eye, EyeOff, GraduationCap, BookOpen, ShieldCheck, UserRound, LockKeyhole, ArrowRight } from "lucide-react"
import "./Login.css"

const roles = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "tutor", label: "Tutor", icon: BookOpen },
  { value: "admin", label: "Admin", icon: ShieldCheck },
]
const identities = {
  student: { name: "admissionNumber", label: "Admission number", placeholder: "Enter your admission number", required: "Admission number is required" },
  tutor: { name: "email", label: "Email address", placeholder: "Enter your email address", required: "Email is required" },
  admin: { name: "username", label: "Username", placeholder: "Enter your username", required: "Username is required" },
}

export default function LoginPanel({ selectedRole, setSelectedRole, showPassword, setShowPassword, isLoading, rememberMe, setRememberMe, register, errors, onSubmit, onForgotPassword, children }) {
  const identity = identities[selectedRole]
  return (
    <main className="hcc-login">
      <section className="hcc-login-brand" aria-label="Hospitality Competence Center Africa">
        <div className="hcc-login-orbit hcc-login-orbit-top" aria-hidden="true" />
        <div className="hcc-login-orbit hcc-login-orbit-bottom" aria-hidden="true" />
        <div className="hcc-login-brand-heading">
          <img src="/favicon.png" alt="HCC" width="44" height="44" />
          <div><strong>HCC</strong><span>Hospitality Competence Center Africa</span></div>
        </div>
        <div className="hcc-login-brand-copy">
          <span className="hcc-login-dot" aria-hidden="true" />
          <p className="hcc-login-welcome">Nice to see you again</p>
          <h1><span>School</span><span>Management</span></h1>
          <div className="hcc-login-rule" aria-hidden="true" />
          <p className="hcc-login-description">Your classes, progress, and school community.<br className="hcc-login-desktop-break" /> Everything you need, in one place.</p>
        </div>
        <p className="hcc-login-brand-footer">LEARN. GROW. CONNECT.</p>
      </section>
      <section className="hcc-login-workspace" aria-label="Sign in">
        <div className="hcc-login-card-wrap">
          <div className="hcc-login-card-accent" aria-hidden="true" />
          <div className="hcc-login-card">
            <header className="hcc-login-card-heading">
              <p className="hcc-login-eyebrow">Login account</p>
              <h2>Sign in to your workspace</h2>
              <p>Select your role and enter your details to continue.</p>
            </header>
            <div className="hcc-login-roles" role="group" aria-label="Account role">
              {roles.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" aria-pressed={selectedRole === value} disabled={isLoading}
                  onClick={() => { setSelectedRole(value); setShowPassword(false) }}
                  className={`hcc-login-role ${selectedRole === value ? "is-selected" : ""}`}>
                  <Icon size={15} aria-hidden="true" /><span>{label}</span>
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="hcc-login-form" noValidate>
              <div className="hcc-login-field">
                <label htmlFor="hcc-login-identity">{identity.label}</label>
                <div className="hcc-login-input-wrap">
                  <UserRound size={16} aria-hidden="true" />
                  <input key={identity.name} id="hcc-login-identity" type={selectedRole === "tutor" ? "email" : "text"}
                    autoComplete="username" placeholder={identity.placeholder}
                    aria-invalid={Boolean(errors[identity.name])}
                    aria-describedby={errors[identity.name] ? "hcc-login-identity-error" : selectedRole === "student" ? "hcc-login-student-hint" : undefined}
                    {...register(identity.name, {
                      required: identity.required,
                      ...(selectedRole === "tutor" ? { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } } : {}),
                    })} />
                </div>
                {errors[identity.name] && <p id="hcc-login-identity-error" className="hcc-login-error" role="alert">{errors[identity.name].message}</p>}
                {selectedRole === "student" && <p id="hcc-login-student-hint" className="hcc-login-hint">First time? Use your phone number as your password.</p>}
              </div>
              <div className="hcc-login-field">
                <label htmlFor="hcc-login-password">Password</label>
                <div className="hcc-login-input-wrap">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input id="hcc-login-password" type={showPassword ? "text" : "password"}
                    autoComplete="current-password" placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "hcc-login-password-error" : undefined}
                    {...register("password", { required: "Password is required" })} />
                  <button type="button" className="hcc-login-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p id="hcc-login-password-error" className="hcc-login-error" role="alert">{errors.password.message}</p>}
              </div>
              <div className="hcc-login-options">
                <label><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /><span>Remember me</span></label>
                <button type="button" onClick={onForgotPassword}>Forgot password?</button>
              </div>
              <button type="submit" className="hcc-login-submit" disabled={isLoading} aria-busy={isLoading}>
                <span>{isLoading ? "Signing in…" : "Sign in"}</span><ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
          </div>
          <p className="hcc-login-workspace-footer">HCC <span aria-hidden="true">/</span> SCHOOL SMS</p>
        </div>
      </section>
      {children}
    </main>
  )
}
