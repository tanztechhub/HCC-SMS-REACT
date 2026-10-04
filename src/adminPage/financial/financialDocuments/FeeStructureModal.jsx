import { useState } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { X } from "lucide-react"

// Separate styles for PDF content to avoid oklch colors
const pdfStyles = {
  wrapper: "mb-4 p-8 rounded-lg bg-white",
  header: "flex justify-between items-start mb-4",
  companyInfo: "text-sm mt-2",
  tableHeader: "p-3 text-left bg-[#cc4400] text-white",
  tableCell: "p-3",
  tableFooter: "p-3 text-right font-bold",
  tableBg: "bg-[#f9fafb]",
  sectionTitle: "font-bold",
  contactGrid: "flex justify-between mt-5",
  footer: "mt-2 pt-4 border-t text-sm text-[#9a3412]",
}

const FeeStructureModal = ({ onClose, courses }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const currentYear = new Date().getFullYear()

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      const content = document.getElementById('feeStructurePDF')

      // Add a slight delay to ensure the DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300))

      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false, // Disable logging in production
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible and styled properly
          const element = clonedDoc.getElementById('feeStructurePDF')
          if (element) {
            element.style.width = '800px'
            element.style.padding = '40px'
            element.style.margin = '0'
            element.style.border = 'none'
          }
        }
      })

      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210 // A4 width in mm (portrait)
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Handle multi-page if content is too tall
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)

      // Add additional pages if needed
      const heightLeft = imgHeight - pageHeight

      if (heightLeft > 0) {
        let heightLeftOnPage = heightLeft;
        let page = 1;

        while (heightLeftOnPage > 0) {
          position = -pageHeight * page
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeftOnPage -= pageHeight
          page += 1
        }
      }

      pdf.save(`fee-structure-${currentYear}.pdf`)
      toast.success("PDF generated successfully!")
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fee Structure {currentYear}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-8 w-8 cursor-pointer" />
          </button>
        </div>

        {/* Preview Section */}
        <section>
          <div id="feeStructurePDF" className={pdfStyles.wrapper}>
            <div className={pdfStyles.header}>
              <div>
                <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20" />
                <p className={pdfStyles.companyInfo}>HCC address pending</p>
                <p className={pdfStyles.companyInfo}>Nairobi</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold mt-2">FEE STRUCTURE {currentYear}</h1>
                <p className={pdfStyles.companyInfo}>Valid from: January {currentYear}</p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr>
                  <th className={pdfStyles.tableHeader}>COURSE</th>
                  <th className={pdfStyles.tableHeader}>DURATION</th>
                  <th className={`${pdfStyles.tableHeader} text-right`}>FEE (KES)</th>
                </tr>
              </thead>
              <tbody className={pdfStyles.tableBg}>
                {courses.map((course, index) => (
                  <tr key={course._id || index}>
                    <td className={pdfStyles.tableCell}>{course.name}</td>
                    <td className={pdfStyles.tableCell}>{course.duration}</td>
                    <td className={`${pdfStyles.tableCell} text-right`}>
                      {course.fee?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
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

              <div className="mt-6">
                <h3 className={pdfStyles.sectionTitle}>Important Notes</h3>
                <ul className="list-disc pl-4 mt-2 text-sm space-y-1">
                  <li>All fees must be paid in full before sitting for any exam</li>
                  <li>Fees are subject to change without prior notice</li>
                  <li>Payment plans are available upon request</li>
                </ul>
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

export default FeeStructureModal