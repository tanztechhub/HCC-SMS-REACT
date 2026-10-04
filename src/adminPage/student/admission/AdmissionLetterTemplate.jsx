const pdfStyles = {
    wrapper: "mb-6 p-4 sm:p-8 rounded-lg bg-white",
    header: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6",
    title: "text-lg sm:text-2xl font-bold text-[#cc4400]",
    subtitle: "text-base sm:text-lg font-medium mt-2",
    contentSection: "mt-8 sm:mt-10 border-t pt-4",
    sectionTitle: "font-bold text-base sm:text-lg mb-2",
    infoGrid: "grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm sm:text-base",
    label: "text-[#9a3412]",
    value: "font-medium break-words",
    footer: "mt-6 pt-4 border-t text-xs sm:text-sm text-[#9a3412]",
}

const formatDate = (date) => {
    if (!date) return "N/A"
    const d = new Date(date)
    return isNaN(d.getTime()) ? date : d.toLocaleDateString()
}

export default function AdmissionLetterTemplate({ student, containerId = "admissionLetterPDF" }) {
    return (
        <div id={containerId} className={pdfStyles.wrapper}>
            <div className={pdfStyles.header}>
                <div>
                    <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-12 sm:h-16" />
                    <p className="text-xs sm:text-sm text-[#9a3412] mt-1">Training Center</p>
                </div>
                <div className="sm:text-right">
                    <h1 className={pdfStyles.title}>ENROLLMENT CONFIRMATION</h1>
                    <p className="text-xs sm:text-sm mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <h2 className={pdfStyles.subtitle}>
                Dear {student.firstName} {student.lastName},
            </h2>

            <p className="mt-2 text-sm sm:text-base">
                We are pleased to inform you that you have been successfully enrolled in the{" "}
                <span className="font-bold text-[#9a3412]">{student.courseName}</span> course at the Hospitality Competence Center Africa.
            </p>

            <div className={pdfStyles.contentSection}>
                <h3 className={pdfStyles.sectionTitle}>Student Information</h3>
                <div className={pdfStyles.infoGrid}>
                    <span className={pdfStyles.label}>Admission Number:</span>
                    <span className={pdfStyles.value}>{student.admissionNumber}</span>

                    <span className={pdfStyles.label}>Name:</span>
                    <span className={pdfStyles.value}>{student.firstName} {student.lastName}</span>

                    <span className={pdfStyles.label}>Email:</span>
                    <span className={pdfStyles.value}>{student.email}</span>

                    <span className={pdfStyles.label}>Phone Number:</span>
                    <span className={pdfStyles.value}>{student.phoneNumber}</span>
                </div>
            </div>

            <div className={pdfStyles.contentSection}>
                <h3 className={pdfStyles.sectionTitle}>Course Details</h3>
                <div className={pdfStyles.infoGrid}>
                    <span className={pdfStyles.label}>Course:</span>
                    <span className={pdfStyles.value}>{student.courseName}</span>

                    <span className={pdfStyles.label}>Duration:</span>
                    <span className={pdfStyles.value}>{student.courseDuration}</span>

                    <span className={pdfStyles.label}>Total Fee:</span>
                    <span className={pdfStyles.value}>KES {Number(student.courseFee || 0).toLocaleString()}</span>

                    <span className={pdfStyles.label}>Upfront Fee Paid:</span>
                    <span className={pdfStyles.value}>KES {Number(student.upfrontFee || 0).toLocaleString()}</span>

                    <span className={pdfStyles.label}>Start Date:</span>
                    <span className={pdfStyles.value}>{formatDate(student.startDate)}</span>
                </div>
            </div>

            <div className={pdfStyles.contentSection}>
                <h3 className={pdfStyles.sectionTitle}>Important Information</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm sm:text-base">
                    <li>Visit <span className="text-[#6082B6] font-bold break-words">HCC portal link pending</span> to access your student portal</li>
                    <li>Please use your phone number as your initial password to log into your student portal.</li>
                    <li>You are encouraged to change your password once you log in.</li>
                    <li>Students are expected to attend at least 75% of the course classes.</li>
                </ul>
            </div>

            <div className={pdfStyles.contentSection}>
                <h3 className={pdfStyles.sectionTitle}>Payment Details</h3>
                <p className="mb-2 text-sm sm:text-base">Fee payments should be made through:</p>
                <div className={pdfStyles.infoGrid}>
                    <span className={pdfStyles.label}>Bank:</span>
                    <span className={pdfStyles.value}>Bank details pending</span>

                    <span className={pdfStyles.label}>Pay Bill:</span>
                    <span className={pdfStyles.value}>Pending HCC confirmation</span>

                    <span className={pdfStyles.label}>Account Number:</span>
                    <span className={pdfStyles.value}>Pending HCC confirmation</span>

                    <span className={pdfStyles.label}>Account Name:</span>
                    <span className={pdfStyles.value}>Hospitality Competence Center Africa</span>

                    <span className={pdfStyles.label}>Branch Name:</span>
                    <span className={pdfStyles.value}>Branch pending</span>
                </div>
            </div>

            <div className={pdfStyles.footer}>
                <p className="text-center">Thank you for choosing Hospitality Competence Center Africa.</p>
                <p className="text-center mt-1">For any queries, please contact us at Contact HCC administration <br />HCC contact pending | HCC contact pending</p>
                <p className="text-center">HCC address pending</p>
                <p className="text-center">Postal address pending</p>
            </div>
        </div>
    )
}
