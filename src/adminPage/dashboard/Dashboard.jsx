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

  return (
    <div className="min-h-screen px-10 pb-20">
      <div className="stats-cards">
        <StatsCards />
      </div>
      <div className="notice-board">
        <NoticeBoard />
      </div>
      <div className="mb-5">
        <FeedbackWidget />
      </div>
      <div className="calender-component">
        <Calendar timetables={timetables} showEdit={false}/>
      </div>
    </div>
  )
}

