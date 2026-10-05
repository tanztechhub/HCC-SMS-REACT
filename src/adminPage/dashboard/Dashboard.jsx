import "./Dashboard.css"
import { useState, useEffect } from "react"
import NoticeBoard from "./noticeBoard/NoticeBoard";
import StatsCards from "./statsCards/StatsCards";
import Calendar from "../../components/calendar/Calendar"
import toast from "react-hot-toast";
import FeedbackWidget from "./feedbackWidget/FeedbackWidget";

const API_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const [timetables, setTimetables] = useState([])

  useEffect(() => {
    fetchTimetables()
  }, [])

  const fetchTimetables = async () => {
    try {
      const response = await fetch(`${API_URL}/timetables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setTimetables(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch timetables")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const user = JSON.parse(localStorage.getItem("user") || "null")
  return (
    <div className="hcc-dashboard">
      <header className="hcc-dashboard-heading">
        <div>
          <p className="hcc-dashboard-eyebrow">01 / SCHOOL OVERVIEW</p>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.username || "Admin"}. Here is your school at a glance.</p>
        </div>
        <time className="hcc-dashboard-date" dateTime={new Date().toISOString().split("T")[0]}>
          {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
        </time>
      </header>
      <section aria-label="School totals">
        <h2 className="hcc-dashboard-section-title">YOUR SCHOOL IN NUMBERS</h2>
        <StatsCards />
      </section>
      <div className="hcc-dashboard-panels">
        <div className="hcc-dashboard-notices"><NoticeBoard /></div>
        <div className="hcc-dashboard-feedback"><FeedbackWidget /></div>
      </div>
      <section className="hcc-dashboard-calendar" aria-label="School calendar">
        <div className="hcc-dashboard-panel-heading"><h2>School calendar</h2><p>Lessons, exams and upcoming events</p></div>
        <Calendar timetables={timetables} showEdit={false} />
      </section>
    </div>
  )
}
