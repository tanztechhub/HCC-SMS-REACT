"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { X, Printer, Download } from "lucide-react"
import toast from "react-hot-toast"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import BillTemplate from "./BillTemplate"

const CONTAINER_ID = "billViewPDF"

export default function BillViewModal({ bill, onClose }) {
    const [isProcessing, setIsProcessing] = useState(false)

    const captureCanvas = async () => {
        const content = document.getElementById(CONTAINER_ID)
        await new Promise((resolve) => setTimeout(resolve, 200))
        return html2canvas(content, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
    }

    const handleDownload = async () => {
        setIsProcessing(true)
        try {
            const canvas = await captureCanvas()
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            const pdf = new jsPDF("p", "mm", "a4")
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(`bill-${bill.billNumber}.pdf`)
            toast.success("PDF downloaded successfully!")
        } catch (error) {
            toast.error(`Failed to generate PDF: ${error.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePrint = async () => {
        setIsProcessing(true)
        try {
            const canvas = await captureCanvas()
            const dataUrl = canvas.toDataURL("image/png")
            const printWindow = window.open("", "_blank")
            if (!printWindow) {
                toast.error("Please allow pop-ups to print the bill")
                return
            }
            printWindow.document.write(
                `<html><head><title>Bill ${bill.billNumber}</title></head>` +
                `<body style="margin:0"><img src="${dataUrl}" style="width:100%" /></body></html>`
            )
            printWindow.document.close()
            printWindow.onload = () => {
                printWindow.focus()
                printWindow.print()
            }
        } catch (error) {
            toast.error("Failed to prepare print preview")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-orange-800/25 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-xl p-4 rounded-md shadow-xl max-h-[90%] overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold">Bill {bill.billNumber}</h2>
                    <span onClick={onClose}>
                        <X className="h-8 w-8 cursor-pointer" />
                    </span>
                </div>

                <BillTemplate bill={bill} containerId={CONTAINER_ID} />

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={isProcessing}
                        className="flex gap-2 items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? <LoadingSpinner size={15} /> : <Printer className="h-4 w-4" />}
                        Print
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isProcessing}
                        className="flex gap-2 items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? <LoadingSpinner size={15} /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    )
}
