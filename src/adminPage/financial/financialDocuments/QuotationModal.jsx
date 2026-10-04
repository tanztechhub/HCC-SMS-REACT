import { useState } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { X } from "lucide-react"

// Separate styles for PDF content to avoid oklch colors
const pdfStyles = {
  wrapper: "mb-6 p-8 rounded-lg bg-white",
  header: "flex justify-between items-start mb-8",
  companyInfo: "text-sm mt-2",
  tableHeader: "p-3 text-left bg-[#cc4400] text-white", // Using hex instead of bg-orange-600
  tableCell: "p-3",
  tableFooter: "p-3 text-right font-bold",
  tableBg: "bg-[#f9fafb]", // Using hex instead of bg-gray-50
  sectionTitle: "font-bold",
  contactGrid: "flex justify-between mt-15",
  footer: "mt-6 pt-4 border-t text-sm text-[#9a3412]",
}

const QuotationModal = ({ onClose, courses }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: "",
    courseEnrolled: "",
    duration: "",
    fee: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => {
      if (name === "courseEnrolled") {
        const selectedCourse = courses.find(course => course.name === value)
        return {
          ...prevState,
          courseEnrolled: value,
          duration: selectedCourse?.duration || "",
          fee: selectedCourse?.fee || ""
        }
      }
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const content = document.getElementById('quotePDF')
      console.log('Starting PDF generation...')

      // Add delay to ensure content is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          console.log('Document cloned, preparing for conversion...')
        }
      })

      console.log('Canvas created successfully')

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = canvas.height * imgWidth / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)

      pdf.save(`quote-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      console.log('PDF generated and saved successfully')
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between w-full">
          <h2 className="text-2xl font-bold mb-4">Generate Quote</h2>
          <span onClick={onClose}>
            <X className="h-6 w-6 cursor-pointer" />
          </span>
        </div>

        {/* Form Section */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              name="courseEnrolled"
              value={formData.courseEnrolled}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-orange-500 focus:outline-none cursor-pointer"
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
        </div>

        {/* Preview Section */}
        <section>
          <div id="quotePDF" className={pdfStyles.wrapper}>
            <div className={pdfStyles.header}>
              <div>
                <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                <p className={pdfStyles.companyInfo}>HCC address pending</p>
                <p className={pdfStyles.companyInfo}>Nairobi</p>
              </div>
              <div className="text-right">
                <p className={pdfStyles.companyInfo}>DATE: {formData.date}</p>
                <p className={pdfStyles.companyInfo}>CLIENT: {formData.clientName}</p>
                <h1 className="text-2xl font-bold mt-2">QUOTE</h1>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr>
                  <th className={pdfStyles.tableHeader}>COURSE</th>
                  <th className={pdfStyles.tableHeader}>DURATION</th>
                  <th className={`${pdfStyles.tableHeader} text-right`}>PRICE</th>
                </tr>
              </thead>
              <tbody className={pdfStyles.tableBg}>
                <tr>
                  <td className={pdfStyles.tableCell}>{formData.courseEnrolled}</td>
                  <td className={pdfStyles.tableCell}>{formData.duration}</td>
                  <td className={`${pdfStyles.tableCell} text-right`}>
                    Kes. {formData.fee?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className={pdfStyles.tableBg}>
                <tr>
                  <td colSpan="2" className={pdfStyles.tableFooter}>GRAND TOTAL</td>
                  <td className={pdfStyles.tableFooter}>
                    Kes {formData.fee?.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold">Payable To</h3>
                <p>Hospitality Competence Center Africa</p>
                <p>Nairobi</p>
              </div>

              <div>
                <h3 className="font-bold">Bank Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p>Payment:</p>
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
        </section>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
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

export default QuotationModal