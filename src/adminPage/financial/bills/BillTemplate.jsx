const pdfStyles = {
    wrapper: "bg-white border-2 border-[#d1d5db] shadow-lg rounded p-6",
    headerBorder: "border-b-4",
    headerBorderColor: "border-[#cc4400]",
    title: "text-center text-xl font-bold mb-4",
    logo: "h-16",
    companyName: "font-bold text-lg text-[#a33700]",
    table: "w-full text-sm",
    tableCellBold: "font-bold",
    status: "capitalize",
    footer: "mt-6 pt-4 border-t text-center text-xs border-[#6b7280]",
}

const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    return isNaN(d.getTime()) ? date : d.toLocaleDateString()
}

export default function BillTemplate({ bill, containerId = "billPDF" }) {
    return (
        <div id={containerId} className={pdfStyles.wrapper}>
            <div className={`flex items-center justify-between ${pdfStyles.headerBorder} ${pdfStyles.headerBorderColor} pb-3 mb-4`}>
                <div>
                    <img src="/wordmark.png" alt="School Logo" className={pdfStyles.logo} />
                </div>
                <div className="text-right text-sm">
                    <p className={pdfStyles.companyName}>Hospitality Competence Center Africa.</p>
                    <p>Nairobi, Kenya</p>
                    <p>Tel: HCC contact pending | HCC contact pending</p>
                </div>
            </div>

            <h1 className={pdfStyles.title}>BILL</h1>
            <table className={pdfStyles.table}>
                <tbody>
                    <tr><td className={pdfStyles.tableCellBold}>Bill Number:</td><td>{bill.billNumber}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Date:</td><td>{formatDate(bill.date)}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Vendor:</td><td>{bill.vendor}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Description:</td><td>{bill.description}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Amount:</td><td>KES {Number(bill.amount || 0).toLocaleString()}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Due Date:</td><td>{formatDate(bill.dueDate)}</td></tr>
                    <tr><td className={pdfStyles.tableCellBold}>Status:</td><td className={pdfStyles.status}>{bill.status}</td></tr>
                </tbody>
            </table>

            <div className={pdfStyles.footer}>
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
}
