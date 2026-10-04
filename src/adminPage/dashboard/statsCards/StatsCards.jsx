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
      bgColor: "bg-cyan-500",
    },
    {
      title: "Tutors",
      total: "Total Tutors",
      count: tutors.length,
      bgColor: "bg-purple-500",
    },
    {
      title: "Staff",
      total: "Total Staff",
      count: staff.length,
      bgColor: "bg-blue-500",
    },
    {
      title: "Inventory",
      total: "Total Inventory Items",
      count: inventory.length,
      bgColor: "bg-pink-500",
    },
  ]

  return (
    <div className="my-6 p-6 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-6 text-orange-800">
        Welcome - Hospitality Competence Center Africa | Admin
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6 text-white transition-transform hover:scale-105 cursor-pointer`}
          >
            <p className="text-2xl font-bold mb-2 text-white">{stat.title}</p>
            <p className="text-white mb-2">{stat.total}</p>
            <div className="text-4xl font-bold flex text-white">
              {loading ? (
                <LoadingSpinner size={20} />
              ) : (
                <span>{stat.count}</span> 
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
