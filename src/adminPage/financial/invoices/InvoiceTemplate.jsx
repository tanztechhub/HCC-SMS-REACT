const pdfStyles = {
    wrapper: "mb-6 p-8 rounded-lg bg-white",
    header: "flex justify-between items-start mb-8",
    companyInfo: "text-sm mt-2",
    tableCell: "p-3",
    tableBg: "bg-[#f9fafb]",
    tableHeader: "p-3 text-left bg-[#cc4400] text-white",
    sectionTitle: "font-bold",
    contactGrid: "flex justify-between mt-15",
    footer: "mt-6 pt-4 border-t text-sm text-[#9a3412]",
    status: "capitalize",
}

const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    return isNaN(d.getTime()) ? date : d.toLocaleDateString()
}

const formatAmount = (amount) => {
    const n = Number(amount)
    return isNaN(n) ? "0" : n.toLocaleString()
}

export default function InvoiceTemplate({ invoice, containerId = "invoicePDF" }) {
    return (
        <div id={containerId} className={pdfStyles.wrapper}>
            <div className={pdfStyles.header}>
                <div>
                    <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                    <p className={pdfStyles.companyInfo}>HCC address pending</p>
                    <p className={pdfStyles.companyInfo}>Nairobi</p>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold">INVOICE</h1>
                    <p className={pdfStyles.companyInfo}>Invoice #: {invoice.invoiceNumber}</p>
                    <p className={pdfStyles.companyInfo}>Date: {formatDate(invoice.dateOfIssue)}</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className={pdfStyles.sectionTitle}>Student Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <p>Name: {invoice.studentName}</p>
                    <p>ADN Number: {invoice.studentAdmnNumber}</p>
                    <p>Course: {invoice.courseEnrolled}</p>
                    <p>Due Date: {formatDate(invoice.paymentDueDate)}</p>
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
                        <td className={pdfStyles.tableCell}>{invoice.courseEnrolled}</td>
                        <td className={`${pdfStyles.tableCell} text-right`}>{formatAmount(invoice.totalAmountDue)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className={`${pdfStyles.tableCell} font-bold`}>Total Due</td>
                        <td className={`${pdfStyles.tableCell} text-right font-bold`}>KES {formatAmount(invoice.totalAmountDue)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="space-y-4">
                <div>
                    <h3 className={pdfStyles.sectionTitle}>Payment Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
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
                        <p>Status:</p>
                        <p className={pdfStyles.status}>{invoice.paymentStatus || "Pending"}</p>
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
                    <p className="text-center mt-1">For any queries, please contact us at Contact HCC administration <br />HCC contact pending | HCC contact pending</p>
                    <p className="text-center">HCC address pending</p>
                    <p className="text-center">Postal address pending</p>
                </div>
            </div>
        </div>
    )
}
