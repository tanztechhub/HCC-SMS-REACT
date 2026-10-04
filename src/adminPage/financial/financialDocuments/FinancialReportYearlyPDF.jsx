// Yearly FinancialReport component (carbon copy of monthly report)
"use client"

import { useState, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { FaDownload } from "react-icons/fa6"

const FinancialReportYearlyPDF = ({ isOpen, onClose, reportData, year }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef(null)

  // Improved color normalization function
  const normalizeColor = (color) => {
    if (!color || typeof color !== 'string') return color
    
    // If it's already a supported format (hex, rgb, rgba), return as is
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color) || /^rgb(a)?\(/.test(color) || /^rgba\(/.test(color)) {
      return color
    }
    
    // Check if it contains unsupported color functions
    if (/oklch|color\(/i.test(color)) {
      // For simple color values, return a default fallback
      if (color.includes('oklch')) {
        if (color.includes('0.9') || color.includes('90%')) return '#f9f9f9'
        if (color.includes('0.7') || color.includes('70%')) return '#cccccc'
        if (color.includes('0.5') || color.includes('50%')) return '#808080'
        if (color.includes('0.3') || color.includes('30%')) return '#4d4d4d'
        if (color.includes('0.1') || color.includes('10%')) return '#1a1a1a'
        return '#000000'
      }
      return '#000000'
    }
    
    // Try DOM-based conversion
    try {
      const temp = document.createElement('div')
      temp.style.position = 'absolute'
      temp.style.left = '-9999px'
      temp.style.color = color
      document.body.appendChild(temp)
      const computed = window.getComputedStyle(temp).color
      document.body.removeChild(temp)
      if (computed && computed !== color && computed !== 'rgba(0, 0, 0, 0)') {
        return computed
      }
    } catch (e) {
      // Ignore DOM errors
    }
    
    return color
  }

  // Enhanced color sanitization
  const sanitizeColors = (rootEl) => {
    if (!rootEl) return
    
    const colorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'boxShadow',
      'textShadow',
      'fill',
      'stroke',
      'stopColor',
      'floodColor',
      'lightingColor'
    ]
    
    const nodes = [rootEl, ...rootEl.querySelectorAll('*')]
    
    nodes.forEach(node => {
      try {
        if (node.style) {
          colorProps.forEach(prop => {
            const inlineValue = node.style[prop]
            if (inlineValue && /oklch|color\(/i.test(inlineValue)) {
              const normalized = normalizeColor(inlineValue)
              if (normalized && normalized !== inlineValue) {
                node.style[prop] = normalized
              }
            }
          })
        }
        
        const cs = window.getComputedStyle(node)
        colorProps.forEach(prop => {
          const computedValue = cs.getPropertyValue(prop)
          if (computedValue && /oklch|color\(/i.test(computedValue)) {
            const normalized = normalizeColor(computedValue)
            if (normalized && normalized !== computedValue) {
              node.style.setProperty(prop, normalized, 'important')
            }
          }
        })
        
        const bgImage = cs.getPropertyValue('backgroundImage')
        if (bgImage && /oklch|color\(/i.test(bgImage)) {
          const simplified = bgImage.replace(/oklach?\([^)]*\)|color\([^)]*\)/gi, (match) => {
            return normalizeColor(match) || '#000000'
          })
          if (simplified !== bgImage) {
            node.style.setProperty('backgroundImage', simplified, 'important')
          }
        }
        
      } catch (e) {
        // Skip nodes that cause errors
      }
    })
  }

  // Force inline all critical styles
  const inlineCriticalStyles = (rootEl) => {
    if (!rootEl) return
    
    const criticalProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'textAlign',
      'padding',
      'margin',
      'width',
      'height',
      'display',
      'position',
      'top',
      'left',
      'right',
      'bottom',
      'transform',
      'boxShadow',
      'borderRadius'
    ]
    
    const nodes = [rootEl, ...rootEl.querySelectorAll('*')]
    
    nodes.forEach(node => {
      try {
        const cs = window.getComputedStyle(node)
        criticalProps.forEach(prop => {
          const val = cs.getPropertyValue(prop)
          if (val && val !== 'none' && val !== 'auto' && val !== '0px') {
            if (prop.includes('Color') || prop === 'color') {
              if (/oklch|color\(/i.test(val)) {
                const normalized = normalizeColor(val)
                if (normalized) {
                  node.style.setProperty(prop, normalized, 'important')
                }
              } else {
                node.style.setProperty(prop, val, 'important')
              }
            } else {
              node.style.setProperty(prop, val, 'important')
            }
          }
        })
      } catch (e) {
        // Skip problematic nodes
      }
    })
  }

// Inline all computed styles onto elements to ensure html2canvas sees resolved values
const inlineAllComputedStyles = (rootEl) => {
  if (!rootEl) return
  const nodes = [rootEl, ...rootEl.querySelectorAll('*')]
  nodes.forEach(node => {
    try {
      const cs = window.getComputedStyle(node)
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i]
        const val = cs.getPropertyValue(prop)
        const pr = cs.getPropertyPriority(prop)
        if (val) node.style.setProperty(prop, val, pr)
      }
    } catch (e) {
      // ignore nodes that throw
    }
  })
}

const generatePDF = async () => {
  if (!reportData) return;

  setIsGenerating(true);
  try {
    const element = reportRef.current;
    if (!element) throw new Error("Report element not found");

    await new Promise((res) => setTimeout(res, 500));

    let canvas
    try {
      const clone = element.cloneNode(true)
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.width = window.getComputedStyle(element).width
      clone.style.boxSizing = 'border-box'
      clone.setAttribute('data-pdf-clone', '1')
      document.body.appendChild(clone)

      try {
        sanitizeColors(clone)
      } catch (e) {
        console.warn('Color sanitization on clone failed:', e)
      }

      try {
        inlineAllComputedStyles(clone)
      } catch (e) {
        console.warn('Inlining computed styles failed:', e)
      }

      canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      clone.remove()
    } catch (e) {
      console.warn('Clone capture failed, falling back to visible element:', e)
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })
    }

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `financial-report-${year}.pdf`;
    pdf.save(fileName);

  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF");
  } finally {
    setIsGenerating(false);
  }
};

const printReport = () => {
  const element = reportRef.current
  if (!element) return

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Financial Report</title><meta name="viewport" content="width=device-width,initial-scale=1" /><style>body{font-family: Arial, Helvetica, sans-serif; color:#111827;background:#ffffff;padding:20px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:6px;text-align:left} th{background:#f3f4f6}</style></head><body>${element.innerHTML}</body></html>`

  const newWin = window.open('', '_blank')
  if (!newWin) {
    alert('Popup blocked. Please allow popups for this site to use Print.')
    return
  }
  newWin.document.open()
  newWin.document.write(html)
  newWin.document.close()
  newWin.focus()

  setTimeout(() => {
    try {
      newWin.print()
    } catch (e) {
      console.error('Print failed', e)
    }
  }, 500)
}


  if (!isOpen || !reportData) return null

  // Safe data access with fallbacks
  const revenue = reportData.revenue || {};
  const expenses = reportData.expenses || {};
  const summary = reportData.summary || {};
  const details = reportData.details || {};

  const studentFees = revenue.studentFees || { 
    expectedTotal: 0, 
    totalCollected: 0, 
    totalPending: 0, 
    studentCount: 0, 
    collectionRate: 0,
    details: [] 
  };
  
  const staffExpenses = expenses.staff || { total: 0, totalSalaries: 0, totalBonuses: 0, staffCount: 0, details: [] };
  const tutorExpenses = expenses.tutors || { total: 0, totalSalaries: 0, totalBonuses: 0, tutorCount: 0, details: [] };
  const invoiceExpenses = expenses.invoices || { total: 0, count: 0, paid: 0, pending: 0 };
  const billExpenses = expenses.bills || { total: 0, count: 0, paid: 0, pending: 0 };

  const receiptDetails = details.receiptDetails || [];
  const studentAnalysis = details.studentAnalysis || [];

  // Build per-student payment summaries using receipt details and expected fees
  const paymentsByAdmn = {};
  receiptDetails.forEach(r => {
    const admn = r.admnNumber || r.admn || r.admnNo || r.admissionNumber
    if (!admn) return
    paymentsByAdmn[admn] = (paymentsByAdmn[admn] || 0) + (Number(r.totalAmountDue) || 0)
  })

  const completedStudents = [];
  const pendingStudents = [];
  const conflictStudents = [];

  studentAnalysis.forEach(s => {
    const admn = s.admissionNumber || s.admnNumber || s.admn || s.admissionNo
    const expected = Number(s.expectedFee || s.courseFee || s.expected || 0) || 0
    const paid = paymentsByAdmn[admn] || Number(s.upfrontFee || s.paid || 0) || 0
    const balance = expected - paid

    const rec = {
      admissionNumber: admn,
      name: s.studentName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'N/A',
      course: s.course || s.courseName || '-',
      expected,
      paid,
      balance
    }

    if (paid > expected) conflictStudents.push(rec)
    else if (balance <= 0) completedStudents.push(rec)
    else pendingStudents.push(rec)
  })

  const sortByName = (a, b) => (a.name || '').localeCompare(b.name || '')
  completedStudents.sort(sortByName)
  pendingStudents.sort(sortByName)
  conflictStudents.sort(sortByName)

  // Chart data preparation
  const feeComparisonData = [
    { name: "Expected", value: studentFees.expectedTotal || 0, color: "#3B82F6" },
    { name: "Collected", value: studentFees.totalCollected || 0, color: "#ea580c" },
    { name: "Pending", value: studentFees.totalPending || 0, color: "#F59E0B" }
  ];

  const expenseData = [
    { name: "Staff Salaries", value: staffExpenses.totalSalaries || 0 },
    { name: "Tutor Salaries", value: tutorExpenses.totalSalaries || 0 },
    { name: "Bonuses", value: (staffExpenses.totalBonuses || 0) + (tutorExpenses.totalBonuses || 0) },
    { name: "Bills", value: billExpenses.total || 0 },
    { name: "Invoices", value: invoiceExpenses.total || 0 }
  ].filter(item => item.value > 0);

  const totalExpenses = expenses.staff?.total + expenses.tutors?.total + expenses.invoices?.total + expenses.bills?.total || 0;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#000000]/50 z-50 p-4">
      <div className="bg-[#ffffff] w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#d1d5db] my-10">
          <h2 className="text-2xl font-bold text-[#111827]">Financial Report - {year}</h2>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-[#cc4400] text-[#ffffff] rounded hover:bg-[#a33700] disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? <LoadingSpinner size={15} /> : <FaDownload size={18} />}
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#374151] hover:text-[#111827] cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="p-8 bg-[#ffffff]">
          {/* Company Header */}
          <div className="text-center mb-10 border-b-2 border-[#cc4400] pb-4">
            <img src="/wordmark.png" alt="Hospitality Competence Center Africa" className="h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#a33700]">{year} Financial Report</h1>
            <p className="text-[#6b7280]"> Hospitality Competence Center Africa</p>
            <p className="text-[#6b7280] text-sm">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Executive Summary and full layout (same as monthly component) */}

          {/* Footer */}
          <div className="border-t border-[#d1d5db] pt-6 text-center text-[#6b7280] text-sm">
            <p>This report was automatically generated by Hospitality Competence Center Africa Financial System</p>
            <p>HCC address pending• Nairobi • Postal address pending</p>
            <p>Tel: HCC contact pending | HCC contact pending • Email: Contact HCC administration</p>
            <p className="mt-2 font-semibold">Confidential Financial Document</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReportYearlyPDF
