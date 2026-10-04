import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import StatsCard from "./StatsCard"
import PaymentTable from "./PaymentTable"
import { GrMoney } from "react-icons/gr";
import { MdOutlineAttachMoney } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { HiOutlineUsers } from "react-icons/hi2";

const API_URL = import.meta.env.VITE_API_URL

export default function SalaryManagement() {
  const [tutors, setTutors] = useState([])
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tutors")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState({
    totalSalaryBudget: 0,
    totalPaid: 0,
    totalPending: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [tutorsResponse, staffResponse] = await Promise.all([
        fetch(`${API_URL}/tutors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${API_URL}/staff`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ])

      const tutorsData = await tutorsResponse.json()
      const staffData = await staffResponse.json()

      if (tutorsData.success && staffData.success) {
        setTutors(tutorsData.data)
        setStaff(staffData.data)
        processStats(tutorsData.data, staffData.data)
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const processStats = (tutorsData, staffData) => {
    let totalSalaryBudget = 0
    let totalPaid = 0
    let totalPending = 0

    tutorsData.forEach((tutor) => {
      totalSalaryBudget += tutor.salary
      tutor.salaryPayments.forEach((payment) => {
        if (payment.status === "paid") {
          totalPaid += payment.amount || 0
        } else {
          totalPending += tutor.salary
        }
      })
    })

    staffData.forEach((staffMember) => {
      totalSalaryBudget += staffMember.salary
      staffMember.salaryPayments.forEach((payment) => {
        if (payment.status === "paid") {
          totalPaid += payment.amount || 0
        } else {
          totalPending += staffMember.salary
        }
      })
    })

    setStats({ totalSalaryBudget, totalPaid, totalPending })
  }

  // Merge the single updated person back into local state instead of
  // refetching the whole tutors/staff roster after every payment or bonus.
  const applyPersonUpdate = (type, updatedPerson) => {
    if (type === "tutors") {
      setTutors((prev) => {
        const next = prev.map((t) => (t._id === updatedPerson._id ? updatedPerson : t))
        processStats(next, staff)
        return next
      })
    } else {
      setStaff((prev) => {
        const next = prev.map((s) => (s._id === updatedPerson._id ? updatedPerson : s))
        processStats(tutors, next)
        return next
      })
    }
  }

  const handleProcessPayment = async (type, id, month, year, amount) => {
    const user = JSON.parse(localStorage.getItem("user"))
    const response = await fetch(`${API_URL}/finance/${type}/${id}/salary`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ month, year, amount, processedBy: user }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to update salary payment")
    applyPersonUpdate(type, data.data)
  }

  const handleAddBonus = async (type, id, bonus) => {
    const response = await fetch(`${API_URL}/finance/${type}/${id}/bonus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ...bonus, processedBy: JSON.parse(localStorage.getItem("user")) }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.message || "Failed to add bonus")
    applyPersonUpdate(type, data.data)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Budget (Ksh)"
          value={stats.totalSalaryBudget.toLocaleString()}
          icon={<GrMoney />}
          description="Monthly salary budget"
        />
        <StatsCard
          title="Total Paid (Ksh)"
          value={stats.totalPaid.toLocaleString()}
          icon={<MdOutlineAttachMoney />}
          description="Total salaries paid"
          color="green"
        />
        <StatsCard
          title="Total Pending (Ksh)"
          value={stats.totalPending.toLocaleString()}
          icon={<TbReportMoney />}
          description="Pending payments"
          color="yellow"
        />
        <StatsCard
          title="Total Staff"
          value={tutors.length + staff.length}
          icon={<HiOutlineUsers />}
          description={`${tutors.length} Tutors, ${staff.length} Staff`}
          color="red"
        />
      </div>

      {/* Payment Tables */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("tutors")}
              className={`${activeTab === "tutors"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium cursor-pointer`}
            >
              Tutors
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`${activeTab === "staff"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium cursor-pointer`}
            >
              Staff
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Months</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[2024, 2025, 2026].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <PaymentTable
            data={activeTab === "tutors" ? tutors : staff}
            type={activeTab}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            formatCurrency={formatCurrency}
            onProcessPayment={handleProcessPayment}
            onAddBonus={handleAddBonus}
          />
        </div>
      </div>
    </div>
  )
}
