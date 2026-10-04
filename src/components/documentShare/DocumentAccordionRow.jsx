"use client"

import { useState } from "react"
import { ChevronDown, Printer, Download, Share2, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "react-hot-toast"
import ShareModal from "./ShareModal"

// A collapsed-by-default row for a shareable document (receipt, admission
// letter, ...). Print/Download/Share work immediately regardless of expand
// state — the template stays mounted (CSS-collapsed, not unmounted) so
// html2canvas can always capture it, mirroring the enrollment-PDF capture
// trick this app already relied on before this component existed.
export default function DocumentAccordionRow({
    title,
    subtitle,
    containerId,
    filename,
    shareUrl,
    shareMessage,
    emailEndpoint,
    admnNumber,
    children,
    defaultExpanded = false,
}) {
    const [expanded, setExpanded] = useState(defaultExpanded)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showShare, setShowShare] = useState(false)

    const captureCanvas = async () => {
        const content = document.getElementById(containerId)
        const wrapper = content.parentElement
        const prevMaxHeight = wrapper.style.maxHeight
        const prevOverflow = wrapper.style.overflow
        wrapper.style.maxHeight = "none"
        wrapper.style.overflow = "visible"

        await new Promise((resolve) => setTimeout(resolve, 300))
        const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })

        wrapper.style.maxHeight = prevMaxHeight
        wrapper.style.overflow = prevOverflow
        return canvas
    }

    const handleDownload = async () => {
        setIsProcessing(true)
        try {
            const canvas = await captureCanvas()
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            const pdf = new jsPDF("p", "mm", "a4")
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(filename)
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
                toast.error("Please allow pop-ups to print")
                return
            }
            printWindow.document.write(
                `<html><head><title>${title}</title></head>` +
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
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-left"
            >
                <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`} />
            </button>

            <div
                style={{
                    maxHeight: expanded ? "3000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                }}
            >
                <div className="p-3 bg-white border-t border-gray-100">{children}</div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-white">
                <button
                    type="button"
                    onClick={handlePrint}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                    {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    Print
                </button>
                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                >
                    {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    Download
                </button>
                <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </button>
            </div>

            {showShare && (
                <ShareModal
                    shareUrl={shareUrl}
                    shareMessage={shareMessage}
                    admnNumber={admnNumber}
                    emailEndpoint={emailEndpoint}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    )
}
