// src/config/adminNavConfig.jsx
//
// Single source of truth for the admin sidebar AND for the Junior Admin
// tab-permission settings UI. Each item's `key` is what gets stored in the
// server-side permission settings and checked by AdminProtection - it must
// stay in sync with `tabKey` props used on the matching <Route> in App.jsx.
//
// `alwaysAllowed`: never gated for Junior Admins (keeps the redirect target
// itself reachable, avoiding a lockout loop).
// `seniorOnly`: never shown to / reachable by Junior Admins, and not
// configurable - matches routes hardcoded to allowedRoles={["senior"]}.
import { FaGraduationCap } from "react-icons/fa6";
import {
  MdDashboard,
  MdPersonAdd,
  MdListAlt,
  MdCancel,
  MdMenuBook,
  MdGrade,
  MdCardMembership,
  MdPeople,
  MdClass,
  MdPayment,
  MdCheckCircle,
  MdPeopleOutline,
  MdAccountBalanceWallet,
  MdBarChart,
  MdLibraryBooks,
  MdAdminPanelSettings,
  MdEmail,
  MdNotifications,
  MdReceipt,
  MdReceiptLong,
  MdDescription,
  MdRequestQuote,
} from "react-icons/md";
import { SiDocsdotrs } from "react-icons/si";
import { LuMessageSquareText } from "react-icons/lu";

export const ADMIN_NAV_SECTIONS = [
  {
    section: "DASHBOARD",
    items: [
      { key: "dashboard", name: "Dashboard", icon: <MdDashboard />, path: "/admin-dash", alwaysAllowed: true },
      { key: "courses", name: "Courses", icon: <MdMenuBook />, path: "/admin-dashboard/courses" },
    ],
  },
  {
    section: "STUDENTS",
    items: [
      { key: "studentsList", name: "Student List", icon: <MdListAlt />, path: "/admin-dashboard/students-list" },
      { key: "applications", name: "Applications", icon: <SiDocsdotrs />, path: "/admin-dashboard/applications" },
      { key: "studentAdmission", name: "Student Admission", icon: <MdPersonAdd />, path: "/admin-dashboard/admission" },
      { key: "cancelAdmission", name: "Cancel Admission", icon: <MdCancel />, path: "/students/cancel-admission" },
    ],
  },
  {
    section: "TEACHERS",
    items: [
      { key: "tutorsList", name: "Tutors List", icon: <MdPeople />, path: "/admin-dashboard/tutors-list" },
      { key: "classAllotment", name: "Class Allotment", icon: <MdClass />, path: "/admin-dashboard/class-allotment" },
    ],
  },
  {
    section: "ATTENDANCE & EXAMS",
    items: [
      { key: "attendance", name: "Attendance Tracking", icon: <MdCheckCircle />, path: "/admin-dashboard/attendance" },
      { key: "examsGrades", name: "Exams & Grades", icon: <MdGrade />, path: "/admin-dashboard/exams-grades" },
      { key: "graduation", name: "Graduation", icon: <FaGraduationCap />, path: "/admin-dashboard/graduation-management" },
    ],
  },
  {
    section: "STAFF & INVENTORY",
    items: [
      { key: "staffList", name: "Staff List", icon: <MdPeopleOutline />, path: "/admin-dashboard/staff" },
      { key: "inventoryManagement", name: "Inventory Management", icon: <MdLibraryBooks />, path: "/admin-dashboard/inventory-management" },
    ],
  },
  {
    section: "ACCOUNTING",
    items: [
      { key: "studentFee", name: "Fee Collection", icon: <MdPayment />, path: "/admin-dashboard/student-fee" },
      { key: "receipts", name: "Receipts", icon: <MdReceipt />, path: "/admin-dashboard/receipts" },
      { key: "invoices", name: "Invoices", icon: <MdDescription />, path: "/admin-dashboard/invoices" },
      { key: "bills", name: "Bills", icon: <MdReceiptLong />, path: "/admin-dashboard/bills" },
      { key: "quotations", name: "Quotations", icon: <MdRequestQuote />, path: "/admin-dashboard/quotations" },
      { key: "salaryManagement", name: "Salary Payments", icon: <MdAccountBalanceWallet />, path: "/admin-dashboard/salary-management", seniorOnly: true },
      { key: "financialDocs", name: "Reports", icon: <MdBarChart />, path: "/admin-dashboard/financial-docs" },
    ],
  },
  {
    section: "COMMUNICATIONS",
    items: [
      { key: "newsletter", name: "Newsletter", icon: <MdEmail />, path: "/admin-dashboard/newsletter" },
      { key: "forums", name: "Forums", icon: <LuMessageSquareText />, path: "/admin-dashboard/forums" },
    ],
  },
  {
    section: "ADMIN MANAGEMENT",
    items: [
      { key: "alumni", name: "Alumni", icon: <FaGraduationCap />, path: "/admin-dashboard/alumni" },
      { key: "adminManagement", name: "Administrators", icon: <MdAdminPanelSettings />, path: "/admin-dashboard/admin-management", seniorOnly: true },
      { key: "notifications", name: "Notifications", icon: <MdNotifications />, path: "/admin-dashboard/notifications" },
      { key: "serverSubscription", name: "Server Subscription", icon: <MdCardMembership />, path: "/admin-dashboard/server-subscription", seniorOnly: true },
    ],
  },
];

// Flat list of items a Senior Admin can pick from when configuring what
// Junior Admins may access.
export const getConfigurableSections = () =>
  ADMIN_NAV_SECTIONS
    .map((section) => ({
      section: section.section,
      items: section.items.filter((item) => !item.seniorOnly && !item.alwaysAllowed),
    }))
    .filter((section) => section.items.length > 0);

// Tab keys that are never gated for Junior Admins (e.g. Dashboard, which is
// also the redirect target on a denied route - it must always be reachable
// or a Junior Admin would loop right back into the same denial).
export const ALWAYS_ALLOWED_TAB_KEYS = ADMIN_NAV_SECTIONS
  .flatMap((section) => section.items)
  .filter((item) => item.alwaysAllowed)
  .map((item) => item.key);
