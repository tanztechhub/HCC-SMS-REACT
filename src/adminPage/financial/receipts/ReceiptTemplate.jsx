const pdfStyles = {
    wrapper: "mb-6 p-4 sm:p-8 rounded-lg bg-white",
    header: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8",
    companyInfo: "text-xs sm:text-sm mt-2",
    tableCell: "p-2 sm:p-3 text-sm sm:text-base",
    tableBg: "bg-[#f9fafb]",
    contactGrid: "flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 sm:mt-15",
    footer: "mt-6 pt-4 border-t text-xs sm:text-sm text-[#9a3412]",
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

export default function ReceiptTemplate({ receipt, containerId = "receiptPDF" }) {
    return (
        <div id={containerId} className={pdfStyles.wrapper}>
            <div className={pdfStyles.header}>
                <div>
                    <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-14 sm:h-20" />
                    <p className={pdfStyles.companyInfo}>HCC address pending</p>
                    <p className={pdfStyles.companyInfo}>Nairobi</p>
                </div>
                <div className="sm:text-right">
                    <h1 className="text-xl sm:text-2xl font-bold">RECEIPT</h1>
                    <p className={pdfStyles.companyInfo}>No: {receipt.receiptNumber}</p>
                    <p className={pdfStyles.companyInfo}>Date: {formatDate(receipt.date)}</p>
                </div>
            </div>

            <div className="space-y-4 mb-6 sm:mb-8">
                <table className="w-full">
                    <tbody className={pdfStyles.tableBg}>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold w-1/3`}>Name:</td>
                            <td className={pdfStyles.tableCell}>{receipt.name}</td>
                        </tr>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>ADMN Number:</td>
                            <td className={pdfStyles.tableCell}>{receipt.admnNumber}</td>
                        </tr>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>Course Enrolled:</td>
                            <td className={pdfStyles.tableCell}>{receipt.courseEnrolled}</td>
                        </tr>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>National ID:</td>
                            <td className={pdfStyles.tableCell}>{receipt.nationalIdNumber}</td>
                        </tr>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>Amount Paid:</td>
                            <td className={pdfStyles.tableCell}>KES {formatAmount(receipt.totalAmountDue)}</td>
                        </tr>
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>Payment Method:</td>
                            <td className={pdfStyles.tableCell}>{receipt.paymentMethod || "—"}</td>
                        </tr>
                        {receipt.transactionCode && (
                            <tr>
                                <td className={`${pdfStyles.tableCell} font-semibold`}>Transaction Code:</td>
                                <td className={pdfStyles.tableCell}>{receipt.transactionCode}</td>
                            </tr>
                        )}
                        <tr>
                            <td className={`${pdfStyles.tableCell} font-semibold`}>Remaining Amount:</td>
                            <td className={pdfStyles.tableCell}>KES {formatAmount(receipt.totalAmountRemaining)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
                <div className={pdfStyles.contactGrid}>
                    <div className="text-xs sm:text-sm">
                        <p>Call/Text:</p>
                        <p>HCC contact pending</p>
                        <p>HCC contact pending</p>
                    </div>
                    <div className="text-xs sm:text-sm sm:text-right">
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
