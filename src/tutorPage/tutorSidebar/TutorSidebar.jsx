import { useState, useEffect } from "react"
import { FaHome, FaUsers, FaBook, FaUserClock, FaMoneyBillWave, FaBars, FaTimes, FaChevronDown } from "react-icons/fa"
import { IoSettings } from "react-icons/io5"
import { CSSTransition } from "react-transition-group"
import { toast } from "react-hot-toast"
import { useLocation, Link } from 'react-router-dom'
import { useRef } from "react";
import { GraduationCap, MessageSquare, ClipboardList, BookOpenCheck } from "lucide-react"
import { SiDocsdotrs } from "react-icons/si";

const API_URL = import.meta.env.VITE_API_URL

export default function TutorSidebar() {
  const [tutor, setTutor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isExamMenuOpen, setIsExamMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null);

  useEffect(() => {
    fetchTutorData()
  }, [])

  const fetchTutorData = async () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not found in localStorage");
      }

      const parsedUser = JSON.parse(storedUser); // Parse the stored JSON string
      const tutorId = parsedUser.id; // Ensure 'id' exists in the stored object

      if (!tutorId) {
        throw new Error("Tutor ID is missing in stored user data. Please Login");
      }

      const response = await fetch(`${API_URL}/tutors/${tutorId}`);
      const data = await response.json();

      if (data.success) {
        setTutor(data.data);

        // Check if cohort is different or missing in local storage
        if (!parsedUser.cohort || parsedUser.cohort !== data.data.currentCohort) {
          parsedUser.cohort = data.data.currentCohort;
          localStorage.setItem("user", JSON.stringify(parsedUser)); // Update local storage
        }
      } else {
        toast.error("Failed to fetch tutor data");
        localStorage.removeItem("user");
        throw new Error(data.message || "Failed to fetch tutor data");
      }
    } catch (error) {
      console.error("Error fetching tutor data:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: FaHome, href: "/teacher-dash" },
    { name: "My Students", icon: FaUsers, href: "/teacher-dashboard/students" },
    { name: "Timetables", icon: FaBook, href: "/teacher-dashboard/lessons" },
    { name: "Curriculum", icon: BookOpenCheck, href: "/teacher-dashboard/curriculum" },
    { name: "Quizes", icon: SiDocsdotrs, href: "/teacher-dashboard/quizes" },
    {
      name: "Exam Management",
      icon: ClipboardList,
      href: "/teacher-dashboard/exams",
      children: [
        { name: "Create Exam", href: "/teacher-dashboard/exams?tab=create" },
        { name: "Assign Exam", href: "/teacher-dashboard/exams?tab=assign" },
        { name: "Mark Exams", href: "/teacher-dashboard/exams?tab=mark" }
      ]
    },
    // { name: "Assign Exams", icon: ClipboardList, href: "/teacher-dashboard/assign-exams" },
    { name: "Grades", icon: GraduationCap, href: "/teacher-dashboard/grades" },
    { name: "Forum", icon: MessageSquare, href: "/teacher-dashboard/forum" },
    { name: "Salary", icon: FaMoneyBillWave, href: "/teacher-dashboard/salary" },
    { name: "Settings", icon: IoSettings, href: "/teacher-dashboard/settings" },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "orange-500"
      case "Assigned":
        return "red-500"
      case "Leave":
        return "yellow-500"
      default:
        return "gray-500"
    }
  }


  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  const NavLink = ({ item, isMobile = false }) => {
    const isExamItem = item.name === "Exam Management" && item.children;
    const isExamRoute = location.pathname.startsWith(item.href || "");
    const isOpen = isExamItem ? isExamMenuOpen || isExamRoute : false;

    if (isExamItem) {
      const baseDesktop = "text-gray-300 hover:bg-gray-800 hover:text-white";
      const baseMobile = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
      const activeDesktop = "bg-orange-700/20 text-orange-300";
      const activeMobile = "bg-indigo-100 text-orange-700";

      return (
        <div className={isMobile ? "" : "my-2"}>
          <button
            type="button"
            onClick={() => setIsExamMenuOpen(prev => !prev)}
            className={`${isExamRoute
              ? (isMobile ? activeMobile : activeDesktop)
              : (isMobile ? baseMobile : baseDesktop)
              } group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors`}
          >
            <item.icon className={`${isMobile ? "mr-4" : "mr-3"} flex-shrink-0 h-6 w-6`} />
            <span className="flex-1 text-left">{item.name}</span>
            <FaChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          {isOpen && (
            <div className={`${isMobile ? "pl-8" : "pl-10"} mt-1 space-y-1`}> 
              {item.children.map(child => (
                <Link
                  key={child.name}
                  to={child.href}
                  className={`${isActiveRoute(child.href)
                    ? (isMobile ? "text-orange-700" : "text-orange-300")
                    : (isMobile ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white")
                    } flex items-center gap-2 text-sm px-2 py-1 rounded-md transition-colors`}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                >
                  <span className={`${isActiveRoute(child.href)
                    ? "bg-orange-400"
                    : (isMobile ? "bg-gray-400" : "bg-gray-500")
                    } h-2 w-2 rounded-full`}
                  ></span>
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        to={item.href}
        className={`${isActiveRoute(item.href)
          ? (isMobile ? "bg-indigo-100 text-orange-700" : "bg-orange-700/20 text-orange-300")
          : isMobile
            ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            : "text-gray-300 hover:bg-gray-800 hover:text-white my-2"
          } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <item.icon className={`${isMobile ? "mr-4" : "mr-3"} flex-shrink-0 h-6 w-6`} />
        {item.name}
      </Link>
    )
  }

  useEffect(() => {
    if (location.pathname.startsWith("/teacher-dashboard/exams")) {
      setIsExamMenuOpen(true)
    }
  }, [location.pathname])

  return (
    <div className="z-99">
      {/* Floating Nav for Mobile */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white rounded-full shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-800"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            {tutor && (
              <>
                <span className="mr-2 text-sm font-medium text-gray-700">
                  {tutor.firstName} {tutor.lastName}
                </span>
                <img
                  src={tutor.profilePicture || "/profile/student.jpg"}
                  alt={`${tutor.firstName} ${tutor.lastName}`}
                  className="h-8 w-8 rounded-full"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <CSSTransition
        in={isMobileMenuOpen}
        timeout={300}
        classNames="menu"
        unmountOnExit
        nodeRef={menuRef} // ✅ Attach the ref here
      >
        <div className="fixed inset-0 bg-[#9a3412]/25 bg-opacity-75 z-40">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.name} item={item} isMobile={true} />
              ))}
            </nav>
          </div>
        </div>
      </CSSTransition>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-[#1a1a1a] shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="ml-5 border-b border-gray-800 flex items-center gap-4">
              <img src="/wordmark.png" alt="HCC Logo" className="h-8 bg-white rounded-md" />
              <h1 className="font-extrabold text-2xl text-white">HCC</h1>
            </div>
            <nav className="mt-5 flex-1 px-1 space-y-1">
              <div className="mb-6 px-4">
                <div className="flex flex-col min-h-20">
                  {!isLoading && tutor && (
                    <div className="mb-6 px-0">
                      <div className="flex items-center justify-between">
                        <img
                          src={tutor.profilePicture || "/profile/student.jpg"}
                          alt={`${tutor.firstName} ${tutor.lastName}`}
                          className="h-22 w-22"
                        />
                        <div className="ml-3 text-right">
                          <p className="text-md font-medium text-white">
                            {tutor.firstName} {tutor.lastName}
                          </p>
                          <p className="text-xs font-medium text-white">- {tutor.role} -</p>
                          <div className="flex gap-2 items-center mt-2 justify-end">
                            <div className={`h-2 w-2 rounded-full bg-${getStatusColor(tutor.status)}`}></div>
                            <span className={`ml-1 text-xs text-${getStatusColor(tutor.status)} text-gray-500`}>{tutor.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mx-3">
                {navItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}