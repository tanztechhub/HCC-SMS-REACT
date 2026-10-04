// Create a new file: components/PDFDownloadModal.jsx
"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import toast from "react-hot-toast"

// Use only hex colors for PDF compatibility
const pdfStyles = {
    wrapper: "mb-6 p-8 rounded-lg bg-[#ffffff]",
    header: "flex justify-between items-start mb-8",
    companyInfo: "text-sm mt-2 text-[#374151]",
    tableHeader: "p-3 text-left bg-[#cc4400] text-[#ffffff]",
    contactGrid: "flex justify-between mt-15",
    tableCell: "p-3 text-[#374151]",
    tableBg: "bg-[#f9fafb]",
    sectionTitle: "font-bold text-[#111827]",
    infoGrid: "grid grid-cols-2 gap-4 text-sm text-[#374151]",
    footer: "mt-6 pt-4 border-t text-sm text-[#9a3412] border-t-[#6b7280]",
}

const receiptPdfStyles = {
    wrapper: "mb-6 p-8 rounded-lg bg-[#ffffff]",
    header: "flex justify-between items-start mb-8",
    companyInfo: "text-sm mt-2 text-[#374151]",
    tableHeader: "p-3 text-left bg-[#cc4400] text-[#ffffff]",
    tableCell: "p-3 text-[#374151]",
    tableBg: "bg-[#f9fafb]",
    sectionTitle: "font-bold text-[#111827]",
    contactGrid: "flex justify-between mt-15",
    footer: "mt-6 pt-4 border-t text-sm text-[#9a3412] border-t-[#6b7280]",
}


// For "March 20, 2025" format:
const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return "Invalid Date";
    }
};

const PDFDownloadModal = ({ isOpen, onClose, documentData, documentType }) => {
    const [isGenerating, setIsGenerating] = useState(false)

    const generatePDF = async () => {
        if (!documentData) return

        setIsGenerating(true)
        try {
            const element = document.getElementById("pdfPreview")
            if (!element) throw new Error("Preview element not found")

            await new Promise((res) => setTimeout(res, 200))

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

            const fileName = `${documentType}-${documentData.documentNumber || documentData.invoiceNumber || documentData.receiptNumber || "document"}.pdf`
            pdf.save(fileName)

        } catch (err) {
            console.error("PDF generation failed:", err)
            toast.error("Failed to generate PDF")
        } finally {
            setIsGenerating(false)
        }
    }


    if (!isOpen || !documentData) return null

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-[#000000]/50 z-50">
            <div className="bg-[#ffffff] p-6 w-[800px] max-h-[90vh] overflow-y-auto rounded-lg">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#111827]">Download {documentType.charAt(0).toUpperCase() + documentType.slice(1)} PDF</h2>
                    <X className="h-8 w-8 cursor-pointer text-[#374151]" onClick={onClose} />
                </div>

                {/* PDF Preview - Reusing your existing structure */}
                <div id="pdfPreview" className="bg-[#ffffff] p-6 border-2 border-[#d1d5db] rounded">
                    {renderPDFContent(documentData, documentType)}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#e5e7eb] text-[#374151] rounded hover:bg-[#d1d5db] cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-[#cc4400] text-[#ffffff] rounded hover:bg-[#a33700] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {isGenerating ? <LoadingSpinner size={15} /> : "Download PDF"}
                        {isGenerating ? "Generating..." : "Download PDF"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Helper function to render different document types
const renderPDFContent = (documentData, documentType) => {
    switch (documentType) {
        case 'bill':
            return (
                <div className="bg-[#ffffff] border-2 border-[#d1d5db] shadow-lg rounded p-6">
                    <div className="flex items-center justify-between border-b-4 border-[#cc4400] pb-3 mb-4">
                        <div>
                            <img src="/wordmark.png" alt="School Logo" className="h-16" />
                        </div>
                        <div className="text-right text-sm text-[#374151]">
                            <p className="font-bold text-lg text-[#a33700]">Hospitality Competence Center Africa.</p>
                            <p>Nairobi, Kenya</p>
                            <p>Tel: HCC contact pending | HCC contact pending</p>
                        </div>
                    </div>

                    <h1 className="text-center text-xl font-bold mb-4 text-[#111827]">BILL</h1>
                    <table className="w-full text-sm text-[#374151]">
                        <tbody>
                            <tr><td className="font-bold">Bill Number:</td><td>{documentData.billNumber}</td></tr>
                            <tr><td className="font-bold">Date:</td><td>{formatDate(documentData.date)}</td></tr>
                            <tr><td className="font-bold">Vendor:</td><td>{documentData.vendor}</td></tr>
                            <tr><td className="font-bold">Description:</td><td>{documentData.description}</td></tr>
                            <tr><td className="font-bold">Amount:</td><td>KES {documentData.amount}</td></tr>
                            <tr><td className="font-bold">Due Date:</td><td>{formatDate(documentData.dueDate)}</td></tr>
                            <tr><td className="font-bold">Status:</td><td className="capitalize">{documentData.status}</td></tr>
                        </tbody>
                    </table>

                    <div className="mt-6 pt-4 border-t text-center text-xs border-[#6b7280] text-[#374151]">
                        <p>Thank you for choosing Hospitality Competence Center Africa.</p>
                        <p className="mt-1">
                            For any queries, please contact us at Contact HCC administration <br />
                            HCC contact pending | HCC contact pending
                        </p>
                        <p>HCC address pending</p>
                        <p>Postal address pending</p>
                    </div>
                </div>
            )

        case 'invoice':
            return (
                <div className={pdfStyles.wrapper}>
                    <div className={pdfStyles.header}>
                        <div>
                            <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                            <p className={pdfStyles.companyInfo}>HCC address pending</p>
                            <p className={pdfStyles.companyInfo}>Nairobi</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-[#111827]">INVOICE</h1>
                            <p className={pdfStyles.companyInfo}>Invoice #: {documentData.invoiceNumber}</p>
                            <p className={pdfStyles.companyInfo}>Date: {formatDate(documentData.dateOfIssue)}</p>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className={pdfStyles.sectionTitle}>Student Information</h2>
                        <div className={`${pdfStyles.infoGrid} mt-2`}>
                            <p>Name: {documentData.studentName}</p>
                            <p>ADN Number: {documentData.studentAdmnNumber}</p>
                            <p>Course: {documentData.courseEnrolled}</p>
                            <p>Due Date: {formatDate(documentData.paymentDueDate)}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr>
                                <th className={pdfStyles.tableHeader}>Description</th>
                                <th className={`${pdfStyles.tableHeader} text-right`}>Amount (KES)</th>
                            </tr>
                        </thead>
                        <tbody className={pdfStyles.tableBg}>
                            <tr>
                                <td className={pdfStyles.tableCell}>{documentData.courseEnrolled}</td>
                                <td className={`${pdfStyles.tableCell} text-right`}>
                                    {Number(documentData.totalAmountDue).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className={`${pdfStyles.tableCell} font-bold`}>Total Due</td>
                                <td className={`${pdfStyles.tableCell} text-right font-bold`}>
                                    KES {Number(documentData.totalAmountDue).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="space-y-4">
                        <div>
                            <h3 className={pdfStyles.sectionTitle}>Payment Information</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-[#374151]">
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

                        <div className={pdfStyles.contactGrid}>
                            <div className="text-[#374151]">
                                <p>Call/Text:</p>
                                <p>HCC contact pending</p>
                                <p>HCC contact pending</p>
                            </div>
                            <div className="text-right text-[#374151]">
                                <p>Contact HCC administration</p>
                                <p>HCC portal link pending</p>
                                <p>Postal address pending</p>
                            </div>
                        </div>

                        <div className={pdfStyles.footer}>
                            <p className="text-center">Thank you for choosing Hospitality Competence Center Africa.</p>
                            <p className="text-center mt-1">For any queries, please contact us at Contact HCC administration <br />HCC contact pending | HCC contact pending</p>
                            <p className="text-center">HCC address pending</p>
                            <p className="text-center">Postal address pending</p>
                        </div>
                    </div>
                </div>
            )

        case 'receipt':
            return (
                <div className={receiptPdfStyles.wrapper}>
                    <div className={receiptPdfStyles.header}>
                        <div>
                            <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                            <p className={receiptPdfStyles.companyInfo}>HCC address pending</p>
                            <p className={receiptPdfStyles.companyInfo}>Nairobi</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-[#111827]">RECEIPT</h1>
                            <p className={receiptPdfStyles.companyInfo}>No: {documentData.receiptNumber}</p>
                            <p className={receiptPdfStyles.companyInfo}>Date: {formatDate(documentData.date)}</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <table className="w-full">
                            <tbody className={receiptPdfStyles.tableBg}>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold w-1/3`}>Name:</td>
                                    <td className={receiptPdfStyles.tableCell}>{documentData.name}</td>
                                </tr>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold`}>ADMN Number:</td>
                                    <td className={receiptPdfStyles.tableCell}>{documentData.admnNumber}</td>
                                </tr>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold`}>Course Enrolled:</td>
                                    <td className={receiptPdfStyles.tableCell}>{documentData.courseEnrolled}</td>
                                </tr>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold`}>National ID:</td>
                                    <td className={receiptPdfStyles.tableCell}>{documentData.nationalIdNumber}</td>
                                </tr>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold`}>Amount Paid:</td>
                                    <td className={receiptPdfStyles.tableCell}>KES {documentData.totalAmountDue?.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className={`${receiptPdfStyles.tableCell} font-semibold`}>Remaining Amount:</td>
                                    <td className={receiptPdfStyles.tableCell}>KES {documentData.totalAmountRemaining?.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#d1d5db]">
                        <div className={receiptPdfStyles.contactGrid}>
                            <div className="text-[#374151]">
                                <p>Call/Text:</p>
                                <p>HCC contact pending</p>
                                <p>HCC contact pending</p>
                            </div>
                            <div className="text-right text-[#374151]">
                                <p>Contact HCC administration</p>
                                <p>HCC portal link pending</p>
                                <p>Postal address pending</p>
                            </div>
                        </div>

                        <div className={receiptPdfStyles.footer}>
                            <p className="text-center">Thank you for choosing Hospitality Competence Center Africa.</p>
                            <p className="text-center mt-1">For any queries, please contact us at Contact HCC administration <br />HCC contact pending | HCC contact pending</p>
                            <p className="text-center">HCC address pending</p>
                            <p className="text-center">Postal address pending</p>
                        </div>
                    </div>
                </div>
            )

        default:
            return <div>Document type not supported</div>
    }
}

export default PDFDownloadModal