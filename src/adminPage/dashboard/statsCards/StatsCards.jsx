import { MdSchool, MdPeople, MdBadge, MdInventory2 } from "react-icons/md"
import { useState, useEffect } from "react"
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL;

export default function StatsCards() {
  const [students, setStudents] = useState([])
  const [tutors, setTutors] = useState([])
  const [staff, setStaff] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true) // ✅ Add loading state

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true) // ✅ Start loading

      const responses = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/tutors`),
        fetch(`${API_URL}/staff`),
        fetch(`${API_URL}/inventory`),
      ])

      // Convert all responses to JSON
      const [studentsData, tutorsData, staffData, inventoryData] = await Promise.all(responses.map(res => res.json()))

      if (studentsData.success && tutorsData.success && staffData.success && inventoryData.success) {
        setStudents(studentsData.data)
        setTutors(tutorsData.data)
        setStaff(staffData.data)
        setInventory(inventoryData.data)
        toast.success(`Data Fetched Sucesss`);
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false) // ✅ Stop loading
    }
  }

  // ✅ Dynamically update the stats array after data is loaded
  const stats = [
    {
      title: "Students",
      total: "Total Students",
      count: students.length,
      tone: "orange", icon: <MdSchool />,
    },
    {
      title: "Tutors",
      total: "Total Tutors",
      count: tutors.length,
      tone: "violet", icon: <MdPeople />,
    },
    {
      title: "Staff",
      total: "Total Staff",
      count: staff.length,
      tone: "cyan", icon: <MdBadge />,
    },
    {
      title: "Inventory",
      total: "Total Inventory Items",
      count: inventory.length,
      tone: "gold", icon: <MdInventory2 />,
    },
  ]

  return (
    <div className="hcc-dashboard-stats" aria-busy={loading}>
      {stats.map((stat) => (
        <article key={stat.title} className={`hcc-dashboard-stat hcc-dashboard-stat--${stat.tone}`}>
          <div className="hcc-dashboard-stat-top"><h3>{stat.title}</h3><span aria-hidden="true">{stat.icon}</span></div>
          <div className="hcc-dashboard-stat-count">{loading ? <LoadingSpinner size={20} /> : stat.count}</div>
          <p>{stat.total}</p>
        </article>
      ))}
    </div>
  )
}
