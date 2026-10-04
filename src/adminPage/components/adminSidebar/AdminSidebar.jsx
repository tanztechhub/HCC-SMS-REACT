import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { ADMIN_NAV_SECTIONS } from "../../../config/adminNavConfig";

const hideScrollbar = {
  overflowY: "scroll",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const hideScrollbarWebkit = {
  ...hideScrollbar,
  WebkitOverflowScrolling: "touch",
  WebkitScrollbar: { display: "none" },
};


export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState({})
  const location = useLocation()
  const juniorAllowedTabs = useSelector((state) => state.permissions.juniorAllowedTabs)
  const user = JSON.parse(localStorage.getItem("user"))
  const isJunior = user?.role === "junior"

  const visibleSections = ADMIN_NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!isJunior) return true
        if (item.alwaysAllowed) return true
        if (item.seniorOnly) return false
        return juniorAllowedTabs.includes(item.key)
      }),
    }))
    .filter((section) => section.items.length > 0)

  const toggleExpand = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }))
  }

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path
    const hasSubItems = item.subItems && item.subItems.length > 0

    // If the item has subitems, render a button, otherwise render a NavLink
    const Component = hasSubItems ? "button" : NavLink

    return (
      <Component
        to={!hasSubItems ? item.path : undefined}
        onClick={() => hasSubItems && toggleExpand(item.name)}
        className={({ isActive: linkIsActive } = {}) => `
          w-full flex items-center gap-2 px-3 py-2 rounded-lg
          transition-colors duration-200 cursor-pointer
          ${
            hasSubItems
              ? expandedItems[item.name]
                ? "bg-[#cc4400]/20 text-white"
                : "text-gray-300 hover:bg-[#cc4400] hover:text-white"
              : linkIsActive || isActive
                ? "bg-[#cc4400] text-white"
                : "text-gray-300 hover:bg-[#cc4400] hover:text-white"
          }
        `}
      >
        <span className="text-xl text-red">{item.icon}</span>
        <span className="flex-1 text-sm">{item.name}</span>
        {hasSubItems && (
          <span className="text-lg">{expandedItems[item.name] ? <MdExpandLess /> : <MdExpandMore />}</span>
        )}
      </Component>
    )
  }

  return (
    <div style={hideScrollbarWebkit} className="w-64 h-screen bg-[#1a1a1a] text-gray-300 fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <img src="/wordmark.png" alt="HCC Logo" className="h-15 bg-white rounded-md" />
        <h1 className="font-extrabold text-xl">HCC <br /> ADMIN </h1>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {visibleSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 mb-2">{section.section}</h2>
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx} >
                  <NavItem item={item} />

                  {/* Submenu */}
                  {item.subItems && (
                    <AnimatePresence>
                      {expandedItems[item.name] && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-9 mt-1"
                        >
                          {item.subItems.map((subItem, subIdx) => (
                            <motion.li
                              key={subIdx}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: subIdx * 0.1 }}
                            >
                              <NavLink
                                to={subItem.path}
                                className={({ isActive }) => `
                                  block py-2 px-3 text-sm
                                  ${
                                    isActive
                                      ? "text-white bg-[#cc4400]/20"
                                      : "text-gray-400 hover:text-white hover:bg-[#cc4400]/10"
                                  }
                                  rounded-lg transition-colors duration-200
                                `}
                              >
                                {subItem.name}
                              </NavLink>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}
