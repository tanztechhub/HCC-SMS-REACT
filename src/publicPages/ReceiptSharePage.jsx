"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Printer, Download, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import ReceiptTemplate from "../adminPage/financial/receipts/ReceiptTemplate"
import ReceiptPDFDocument from "../adminPage/financial/receipts/ReceiptPDFDocument"
import { downloadPdf, printPdf } from "./pdfUtils"

const API_URL = import.meta.env.VITE_API_URL
const CONTAINER_ID = "publicReceiptPDF"

export default function ReceiptSharePage() {
    const { receiptNumber } = useParams()
    const [receipt, setReceipt] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await fetch(`${API_URL}/receipts/number/${encodeURIComponent(receiptNumber)}`)
                const data = await res.json()
                if (!data.success) throw new Error(data.message || "Receipt not found")
                setReceipt(data.data)
            } catch (err) {
                setError(err.message || "Receipt not found")
            } finally {
                setIsLoading(false)
            }
        }
        fetchReceipt()
    }, [receiptNumber])

    const handleDownload = async () => {
        setIsProcessing(true)
        try {
            await downloadPdf(<ReceiptPDFDocument receipt={receipt} />, `receipt-${receipt.receiptNumber}.pdf`)
        } catch (err) {
            toast.error("Failed to generate PDF")
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePrint = async () => {
        setIsProcessing(true)
        try {
            await printPdf(<ReceiptPDFDocument receipt={receipt} />)
        } catch (err) {
            toast.error("Failed to prepare print preview")
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (error || !receipt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm">
                    <p className="text-lg font-semibold text-gray-900 mb-1">Receipt not found</p>
                    <p className="text-sm text-gray-500">{error || "This receipt link may be invalid."}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-xl mx-auto">
                <ReceiptTemplate receipt={receipt} containerId={CONTAINER_ID} />

                <div className="flex justify-center gap-3 mt-4 pb-8">
                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        Print
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    )
}
