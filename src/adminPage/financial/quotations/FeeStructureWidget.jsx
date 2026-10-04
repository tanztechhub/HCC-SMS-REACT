"use client"

import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import toast from "react-hot-toast"
import { Download } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"

const pdfStyles = {
    wrapper: "bg-white border-2 border-[#d1d5db] shadow-lg rounded p-6",
    header: "flex justify-between items-start mb-4",
    companyInfo: "text-sm mt-2",
    tableHeader: "p-3 text-left bg-[#cc4400] text-white",
    tableCell: "p-3",
    tableBg: "bg-[#f9fafb]",
    sectionTitle: "font-bold",
    contactGrid: "flex justify-between mt-5",
    footer: "mt-2 pt-4 border-t text-sm text-[#9a3412]",
}

const formatMonthYear = (monthValue) => {
    if (!monthValue) return ""
    const [year, month] = monthValue.split("-")
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export default function FeeStructureWidget({ courses }) {
    const now = new Date()
    const defaultFrom = `${now.getFullYear()}-01`
    const defaultTo = `${now.getFullYear()}-12`

    const [validFrom, setValidFrom] = useState(defaultFrom)
    const [validTo, setValidTo] = useState(defaultTo)
    const [selectedCourseIds, setSelectedCourseIds] = useState(new Set())
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        setSelectedCourseIds(new Set(courses.map((c) => c._id)))
    }, [courses])

    const toggleCourse = (id) => {
        setSelectedCourseIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        setSelectedCourseIds((prev) =>
            prev.size === courses.length ? new Set() : new Set(courses.map((c) => c._id))
        )
    }

    const selectedCourses = courses.filter((c) => selectedCourseIds.has(c._id))

    const generatePDF = async () => {
        if (selectedCourses.length === 0) {
            toast.error("Select at least one course")
            return
        }

        setIsGenerating(true)
        try {
            const content = document.getElementById("feeStructurePDF")
            await new Promise((resolve) => setTimeout(resolve, 300))

            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

            const imgWidth = 210
            const pageHeight = 297
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let position = 0
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)

            const heightLeft = imgHeight - pageHeight
            if (heightLeft > 0) {
                let heightLeftOnPage = heightLeft
                let page = 1
                while (heightLeftOnPage > 0) {
                    position = -pageHeight * page
                    pdf.addPage()
                    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
                    heightLeftOnPage -= pageHeight
                    page += 1
                }
            }

            pdf.save(`fee-structure-${validFrom}-to-${validTo}.pdf`)
            toast.success("PDF downloaded successfully!")
        } catch (error) {
            toast.error(`Failed to generate PDF: ${error.message || "Unknown error"}`)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Fee Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valid From</label>
                            <input
                                type="month"
                                value={validFrom}
                                onChange={(e) => setValidFrom(e.target.value)}
                                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                            <input
                                type="month"
                                value={validTo}
                                onChange={(e) => setValidTo(e.target.value)}
                                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Courses to Include</label>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-xs text-orange-700 hover:underline cursor-pointer"
                            >
                                {selectedCourseIds.size === courses.length ? "Deselect all" : "Select all"}
                            </button>
                        </div>
                        <div className="border-2 border-gray-200 rounded-md max-h-64 overflow-y-auto divide-y divide-gray-100">
                            {courses.length === 0 ? (
                                <p className="p-3 text-sm text-gray-500">No courses found</p>
                            ) : (
                                courses.map((course) => (
                                    <label
                                        key={course._id}
                                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCourseIds.has(course._id)}
                                            onChange={() => toggleCourse(course._id)}
                                            className="cursor-pointer"
                                        />
                                        <span className="flex-1">{course.name}</span>
                                        <span className="text-gray-500">KES {Number(course.fee || 0).toLocaleString()}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                    >
                        {isGenerating ? <LoadingSpinner size={15} /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </button>
                </div>

                <div id="feeStructurePDF" className={pdfStyles.wrapper}>
                    <div className={pdfStyles.header}>
                        <div>
                            <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                            <p className={pdfStyles.companyInfo}>HCC address pending</p>
                            <p className={pdfStyles.companyInfo}>Nairobi</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-xl font-bold mt-2">FEE STRUCTURE</h1>
                            <p className={pdfStyles.companyInfo}>
                                Valid: {formatMonthYear(validFrom)} – {formatMonthYear(validTo)}
                            </p>
                        </div>
                    </div>

                    <table className="w-full mb-8 text-sm">
                        <thead>
                            <tr>
                                <th className={pdfStyles.tableHeader}>COURSE</th>
                                <th className={pdfStyles.tableHeader}>DURATION</th>
                                <th className={`${pdfStyles.tableHeader} text-right`}>FEE (KES)</th>
                            </tr>
                        </thead>
                        <tbody className={pdfStyles.tableBg}>
                            {selectedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className={`${pdfStyles.tableCell} text-center text-gray-500`}>
                                        No courses selected
                                    </td>
                                </tr>
                            ) : (
                                selectedCourses.map((course) => (
                                    <tr key={course._id}>
                                        <td className={pdfStyles.tableCell}>{course.name}</td>
                                        <td className={pdfStyles.tableCell}>{course.duration}</td>
                                        <td className={`${pdfStyles.tableCell} text-right`}>
                                            {Number(course.fee || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className={pdfStyles.sectionTitle}>Payment Information</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <p>Payment Methods:</p>
                                <p>MPESA/CASH</p>
                                <p>Paybill:</p>
                                <p>Pending HCC confirmation</p>
                                <p>Swift:</p>
                                <p>KCBLKENX</p>
                                <p>Acc No:</p>
                                <p>Pending HCC confirmation</p>
                                <p>Acc Name:</p>
                                <p>Hospitality Competence Center Africa</p>
                                <p>Branch Name:</p>
                                <p>Branch pending</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className={pdfStyles.sectionTitle}>Important Notes</h3>
                            <ul className="list-disc pl-4 mt-2 text-sm space-y-1">
                                <li>All fees must be paid in full before sitting for any exam</li>
                                <li>Fees are subject to change without prior notice</li>
                                <li>Payment plans are available upon request</li>
                            </ul>
                        </div>

                        <div className={pdfStyles.contactGrid}>
                            <div>
                                <p>Call/Text:</p>
                                <p>HCC contact pending</p>
                                <p>HCC contact pending</p>
                            </div>
                            <div className="text-right">
                                <p>Contact HCC administration</p>
                                <p>HCC portal link pending</p>
                                <p>Postal address pending</p>
                            </div>
                        </div>

                        <div className={pdfStyles.footer}>
                            <p className="text-center">Thank you for choosing Hospitality Competence Center Africa.</p>
                            <p className="text-center mt-1">
                                For any queries, please contact us at Contact HCC administration <br />
                                HCC contact pending | HCC contact pending
                            </p>
                            <p className="text-center">HCC address pending</p>
                            <p className="text-center">Postal address pending</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
