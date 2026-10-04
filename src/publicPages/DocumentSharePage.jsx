"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Printer, Download, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import ReceiptTemplate from "../adminPage/financial/receipts/ReceiptTemplate"
import ReceiptPDFDocument from "../adminPage/financial/receipts/ReceiptPDFDocument"
import AdmissionLetterTemplate from "../adminPage/student/admission/AdmissionLetterTemplate"
import AdmissionLetterPDFDocument from "../adminPage/student/admission/AdmissionLetterPDFDocument"
import { downloadPdf, printPdf } from "./pdfUtils"

const API_URL = import.meta.env.VITE_API_URL
const CONTAINER_ID = "publicDocumentPDF"

// One public, unauthenticated page for every shareable document type — the
// :type param picks the fetch endpoint and template, so new document types
// only need an entry here rather than a whole new page.
const DOCUMENT_CONFIG = {
    receipt: {
        fetchUrl: (id) => `${API_URL}/receipts/number/${encodeURIComponent(id)}`,
        filename: (data) => `receipt-${data.receiptNumber}.pdf`,
        notFoundMessage: "Receipt not found",
        Template: ReceiptTemplate,
        PDFDocument: ReceiptPDFDocument,
        toProps: (data) => ({ receipt: data }),
    },
    admission: {
        fetchUrl: (id) => `${API_URL}/students/admission-letter/${encodeURIComponent(id)}`,
        filename: (data) => `admission-letter-${data.admissionNumber}.pdf`,
        notFoundMessage: "Admission letter not found",
        Template: AdmissionLetterTemplate,
        PDFDocument: AdmissionLetterPDFDocument,
        toProps: (data) => ({ student: data }),
    },
}

export default function DocumentSharePage() {
    const { type, id } = useParams()
    const config = DOCUMENT_CONFIG[type]

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!config) {
            setError("Unknown document type")
            setIsLoading(false)
            return
        }
        const fetchData = async () => {
            try {
                const res = await fetch(config.fetchUrl(id))
                const result = await res.json()
                if (!result.success) throw new Error(result.message || config.notFoundMessage)
                setData(result.data)
            } catch (err) {
                setError(err.message || config.notFoundMessage)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [type, id])

    const handleDownload = async () => {
        setIsProcessing(true)
        try {
            const { PDFDocument, toProps, filename } = config
            await downloadPdf(<PDFDocument {...toProps(data)} />, filename(data))
        } catch (err) {
            toast.error("Failed to generate PDF")
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePrint = async () => {
        setIsProcessing(true)
        try {
            const { PDFDocument, toProps } = config
            await printPdf(<PDFDocument {...toProps(data)} />)
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

    if (error || !data || !config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm">
                    <p className="text-lg font-semibold text-gray-900 mb-1">{config?.notFoundMessage || "Document not found"}</p>
                    <p className="text-sm text-gray-500">{error || "This link may be invalid."}</p>
                </div>
            </div>
        )
    }

    const { Template, toProps } = config

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-xl mx-auto">
                <Template {...toProps(data)} containerId={CONTAINER_ID} />

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
