"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { fetchJuniorPermissions, updateJuniorPermissions } from "../../store/permissionsSlice"
import { getConfigurableSections } from "../../config/adminNavConfig"

export default function PermissionsSettings() {
  const dispatch = useDispatch()
  const { juniorAllowedTabs, status, saving } = useSelector((state) => state.permissions)
  const [selected, setSelected] = useState([])
  const sections = getConfigurableSections()

  useEffect(() => {
    dispatch(fetchJuniorPermissions())
  }, [dispatch])

  useEffect(() => {
    setSelected(juniorAllowedTabs)
  }, [juniorAllowedTabs])

  const toggleTab = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleSection = (items, checked) => {
    const keys = items.map((item) => item.key)
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...keys]))
        : prev.filter((k) => !keys.includes(k))
    )
  }

  const handleSave = async () => {
    try {
      await dispatch(updateJuniorPermissions(selected)).unwrap()
      toast.success("Junior admin permissions updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update permissions")
    }
  }

  if (status === "loading" && juniorAllowedTabs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <p className="text-gray-600 max-w-2xl">
          Choose which tabs Junior Admins are allowed to open. Senior Admins always
          have full access and are not affected by these settings.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const allChecked = section.items.every((item) => selected.includes(item.key))
          return (
            <div key={section.section} className="bg-white shadow-lg rounded-lg p-4">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="font-semibold text-gray-700">{section.section}</h3>
                <label className="flex items-center text-xs gap-1 cursor-pointer text-gray-500">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleSection(section.items, e.target.checked)}
                  />
                  Select All
                </label>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.key)}
                      onChange={() => toggleTab(item.key)}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
