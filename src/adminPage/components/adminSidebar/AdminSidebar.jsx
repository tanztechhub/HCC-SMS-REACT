import { useState } from "react"
import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import { MdExpandMore, MdExpandLess } from "react-icons/md"
import { ADMIN_NAV_SECTIONS } from "../../../config/adminNavConfig"
import "./AdminSidebar.css"

export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState({})
  const juniorAllowedTabs = useSelector((state) => state.permissions.juniorAllowedTabs)
  const user = JSON.parse(localStorage.getItem("user"))
  const isJunior = user?.role === "junior"
  const visibleSections = ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!isJunior || item.alwaysAllowed) return true
      if (item.seniorOnly) return false
      return juniorAllowedTabs.includes(item.key)
    }),
  })).filter((section) => section.items.length > 0)

  const itemContent = (item, hasSubItems) => (
    <>
      <span className="hcc-sidebar-node" aria-hidden="true" />
      <span className="hcc-sidebar-icon" aria-hidden="true">{item.icon}</span>
      <span className="hcc-sidebar-label">{item.name}</span>
      {hasSubItems && (expandedItems[item.name] ? <MdExpandLess /> : <MdExpandMore />)}
    </>
  )

  return (
    <aside className="hcc-sidebar" aria-label="Admin sidebar">
      <header className="hcc-sidebar-brand">
        <span className="hcc-sidebar-wordmark">HCC</span>
        <div className="hcc-sidebar-brand-copy">
          <strong>School Management</strong>
          <span>Admin workspace</span>
        </div>
      </header>
      <nav className="hcc-sidebar-nav" aria-label="Admin navigation">
        {visibleSections.map((section) => (
          <section className="hcc-sidebar-category" key={section.section}>
            <h2>{section.section}</h2>
            <ul className="hcc-sidebar-items">
              {section.items.map((item) => {
                const hasSubItems = Boolean(item.subItems?.length)
                return (
                  <li className="hcc-sidebar-item" key={item.key}>
                    {hasSubItems ? (
                      <button
                        type="button"
                        className={`hcc-sidebar-link${expandedItems[item.name] ? " is-expanded" : ""}`}
                        aria-expanded={Boolean(expandedItems[item.name])}
                        onClick={() => setExpandedItems((prev) => ({ ...prev, [item.name]: !prev[item.name] }))}
                      >
                        {itemContent(item, true)}
                      </button>
                    ) : (
                      <NavLink to={item.path} className={({ isActive }) => `hcc-sidebar-link${isActive ? " is-active" : ""}`}>
                        {itemContent(item, false)}
                      </NavLink>
                    )}
                    {hasSubItems && (
                      <AnimatePresence>
                        {expandedItems[item.name] && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="hcc-sidebar-submenu"
                          >
                            {item.subItems.map((subItem) => (
                              <li key={subItem.path}>
                                <NavLink to={subItem.path} className={({ isActive }) => `hcc-sidebar-sublink${isActive ? " is-active" : ""}`}>
                                  {subItem.name}
                                </NavLink>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
