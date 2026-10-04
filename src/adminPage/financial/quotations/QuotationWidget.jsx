"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import toast from "react-hot-toast"
import { Download } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"

const pdfStyles = {
    wrapper: "bg-white border-2 border-[#d1d5db] shadow-lg rounded p-6",
    header: "flex justify-between items-start mb-8",
    companyInfo: "text-sm mt-2",
    tableHeader: "p-3 text-left bg-[#cc4400] text-white",
    tableCell: "p-3",
    tableFooter: "p-3 text-right font-bold",
    tableBg: "bg-[#f9fafb]",
    contactGrid: "flex justify-between mt-15",
    footer: "mt-6 pt-4 border-t text-sm text-[#9a3412]",
}

export default function QuotationWidget({ courses }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        clientName: "",
        courseEnrolled: "",
        duration: "",
        fee: "",
    })
    const [isGenerating, setIsGenerating] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => {
            if (name === "courseEnrolled") {
                const selectedCourse = courses.find((course) => course.name === value)
                return {
                    ...prev,
                    courseEnrolled: value,
                    duration: selectedCourse?.duration || "",
                    fee: selectedCourse?.fee || "",
                }
            }
            return { ...prev, [name]: value }
        })
    }

    const generatePDF = async () => {
        if (!formData.clientName || !formData.courseEnrolled) {
            toast.error("Client name and course are required")
            return
        }

        setIsGenerating(true)
        try {
            const content = document.getElementById("quotePDF")
            await new Promise((resolve) => setTimeout(resolve, 300))

            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            const pdf = new jsPDF("p", "mm", "a4")
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(`quote-${formData.clientName.replace(/\s+/g, "-").toLowerCase()}.pdf`)
            toast.success("PDF downloaded successfully!")
        } catch (error) {
            toast.error(`Failed to generate PDF: ${error.message}`)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quotation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client Name</label>
                        <input
                            type="text"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select
                            name="courseEnrolled"
                            value={formData.courseEnrolled}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course.name}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
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

                <div id="quotePDF" className={pdfStyles.wrapper}>
                    <div className={pdfStyles.header}>
                        <div>
                            <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                            <p className={pdfStyles.companyInfo}>HCC address pending</p>
                            <p className={pdfStyles.companyInfo}>Nairobi</p>
                        </div>
                        <div className="text-right">
                            <p className={pdfStyles.companyInfo}>DATE: {formData.date}</p>
                            <p className={pdfStyles.companyInfo}>CLIENT: {formData.clientName}</p>
                            <h1 className="text-2xl font-bold mt-2">QUOTE</h1>
                        </div>
                    </div>

                    <table className="w-full mb-8 text-sm">
                        <thead>
                            <tr>
                                <th className={pdfStyles.tableHeader}>COURSE</th>
                                <th className={pdfStyles.tableHeader}>DURATION</th>
                                <th className={`${pdfStyles.tableHeader} text-right`}>PRICE</th>
                            </tr>
                        </thead>
                        <tbody className={pdfStyles.tableBg}>
                            <tr>
                                <td className={pdfStyles.tableCell}>{formData.courseEnrolled}</td>
                                <td className={pdfStyles.tableCell}>{formData.duration}</td>
                                <td className={`${pdfStyles.tableCell} text-right`}>
                                    Kes. {Number(formData.fee || 0).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot className={pdfStyles.tableBg}>
                            <tr>
                                <td colSpan="2" className={pdfStyles.tableFooter}>GRAND TOTAL</td>
                                <td className={pdfStyles.tableFooter}>Kes {Number(formData.fee || 0).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-bold">Payable To</h3>
                            <p>Hospitality Competence Center Africa</p>
                            <p>Nairobi</p>
                        </div>

                        <div>
                            <h3 className="font-bold">Bank Details</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <p>Payment:</p>
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
