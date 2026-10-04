import { useState } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { X } from "lucide-react"
import { IoSaveOutline } from "react-icons/io5"
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'

const pdfStyles = {
  wrapper: "mb-6 p-8 rounded-lg bg-white",
  header: "flex justify-between items-start mb-8",
  companyInfo: "text-sm mt-2",
  tableHeader: "p-3 text-left bg-[#cc4400] text-white",
  contactGrid: "flex justify-between mt-15",
  tableCell: "p-3",
  tableBg: "bg-[#f9fafb]",
  sectionTitle: "font-bold",
  infoGrid: "grid grid-cols-2 gap-4 text-sm",
  footer: "mt-6 pt-4 border-t text-sm text-[#9a3412]",
}

const InvoiceModal = ({ onClose, onSubmit, courses, isSubmitting }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    dateOfIssue: "",
    studentName: "",
    studentAdmnNumber: "",
    courseEnrolled: "",
    totalAmountDue: "",
    paymentDueDate: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const content = document.getElementById('invoicePDF')
      console.log('Starting PDF generation...')

      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        removeContainer: false,
        imageTimeout: 15000
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = canvas.height * imgWidth / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)

      pdf.save(`invoice-${formData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-orange-800/25 fixed inset-0 z-50 flex items-center justify-center py-4">
      <div className="bg-white w-[800px] p-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Invoice</h2>
          <span onClick={onClose}>
            <X className="h-8 w-8 cursor-pointer" />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                placeholder="e.g INV-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
              <input
                type="date"
                name="dateOfIssue"
                value={formData.dateOfIssue}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ADN Number</label>
              <input
                type="text"
                name="studentAdmnNumber"
                value={formData.studentAdmnNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Enrolled</label>
              <select
                name="courseEnrolled"
                value={formData.courseEnrolled}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount Due</label>
              <input
                type="number"
                name="totalAmountDue"
                value={formData.totalAmountDue}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Due Date</label>
            <input
              type="date"
              name="paymentDueDate"
              value={formData.paymentDueDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
              required
            />
          </div>
        </form>

        {/* PDF Preview */}
        <div id="invoicePDF" className={pdfStyles.wrapper}>
          <div className={pdfStyles.header}>
            <div>
              <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
              <p className={pdfStyles.companyInfo}>HCC address pending</p>
              <p className={pdfStyles.companyInfo}>Nairobi</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className={pdfStyles.companyInfo}>Invoice #: {formData.invoiceNumber}</p>
              <p className={pdfStyles.companyInfo}>Date: {formData.dateOfIssue}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className={pdfStyles.sectionTitle}>Student Information</h2>
            <div className={`${pdfStyles.infoGrid} mt-2`}>
              <p>Name: {formData.studentName}</p>
              <p>ADN Number: {formData.studentAdmnNumber}</p>
              <p>Course: {formData.courseEnrolled}</p>
              <p>Due Date: {formData.paymentDueDate}</p>
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
                <td className={pdfStyles.tableCell}>{formData.courseEnrolled}</td>
                <td className={`${pdfStyles.tableCell} text-right`}>
                  {Number(formData.totalAmountDue).toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className={`${pdfStyles.tableCell} font-bold`}>Total Due</td>
                <td className={`${pdfStyles.tableCell} text-right font-bold`}>
                  KES {Number(formData.totalAmountDue).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="space-y-4">
            <div>
              <h3 className={pdfStyles.sectionTitle}>Payment Information</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
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

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
            disabled={isGenerating || isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isGenerating || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            {isSubmitting ? <LoadingSpinner size={15} /> : <IoSaveOutline />}
            Save
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating || isSubmitting}
            className="px-4 py-2 bg-[#cc4400] text-white rounded hover:bg-[#a33700] disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">↻</span>
                <span>Generating...</span>
              </>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal