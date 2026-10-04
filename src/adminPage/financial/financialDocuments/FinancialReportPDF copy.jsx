// Complete FinancialReportPDF.jsx with all insightful sections restored
"use client"

import { useState, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { FaDownload } from "react-icons/fa6"

const FinancialReportPDF = ({ isOpen, onClose, reportData, period }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef(null)

// Normalize any CSS color values to browser-normalized formats (rgb/hex)
const normalizeColor = (color) => {
  if (!color) return color
  // Fast-return if already in rgb/rgba/hex format
  if (/^rgb|rgba|^#/.test(color.trim())) return color

  // Try DOM-based conversion: set color on a temporary element and read computed style
  try {
    const temp = document.createElement('div')
    temp.style.position = 'absolute'
    temp.style.left = '-9999px'
    temp.style.color = color
    document.body.appendChild(temp)
    const computed = window.getComputedStyle(temp).color
    document.body.removeChild(temp)
    if (computed && computed !== color) return computed
  } catch (e) {
    // ignore
  }

  // Fallback: canvas parsing (may not support newer color functions)
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.fillStyle = color
    return ctx.fillStyle
  } catch (e) {
    return color
  }
}

const sanitizeColors = (rootEl) => {
  if (!rootEl) return
  const props = [
    'color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
    'boxShadow','outlineColor','fill','stroke','backgroundImage'
  ]
  const nodes = [rootEl, ...rootEl.querySelectorAll('*')]
  nodes.forEach(node => {
    try {
      const cs = window.getComputedStyle(node)
      props.forEach(p => {
        const val = cs.getPropertyValue(p)
        if (val && /oklch|color\(/i.test(val)) {
          const normalized = normalizeColor(val)
          if (normalized && normalized !== val) {
            // For background-image or complex values, try to replace only color function occurrences
            if (p === 'backgroundImage') {
              // If background-image contains gradients etc., replace color functions conservatively
              node.style[p] = val.replace(/color\([^)]*\)|oklch\([^)]*\)/gi, (match) => normalizeColor(match))
            } else if (p === 'boxShadow') {
              // boxShadow may contain multiple color tokens; replace them
              node.style[p] = val.replace(/color\([^)]*\)|oklch\([^)]*\)/gi, (match) => normalizeColor(match))
            } else {
              node.style[p] = normalized
            }
          }
        }
      })
    } catch (e) {
      // ignore nodes that throw
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
      // Copy each computed property to the element's style
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

    // Give time for layout and charts to render
    await new Promise((res) => setTimeout(res, 500));

    // Create a sanitized off-screen clone so we don't mutate visible UI
    let canvas
    try {
      const clone = element.cloneNode(true)
      // Position off-screen so it doesn't affect layout or visibility
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.width = window.getComputedStyle(element).width
      clone.style.boxSizing = 'border-box'
      clone.setAttribute('data-pdf-clone', '1')
      document.body.appendChild(clone)

      // Sanitize color values on the clone so html2canvas receives hex/rgb values
      try {
        sanitizeColors(clone)
      } catch (e) {
        console.warn('Color sanitization on clone failed:', e)
      }

      // Inline all computed styles to ensure resolved values (colors, shadows, gradients) are applied
      try {
        inlineAllComputedStyles(clone)
      } catch (e) {
        console.warn('Inlining computed styles failed:', e)
      }

      // Capture high-quality canvas from the clone
      canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // Clean up the clone
      clone.remove()
    } catch (e) {
      // Fallback: try capturing the visible element if clone capture fails
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

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if content is taller than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `financial-report-${period.replace(" ", "-")}.pdf`;
    pdf.save(fileName);

  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF");
  } finally {
    setIsGenerating(false);
  }
};


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
          <h2 className="text-2xl font-bold text-[#111827]">Financial Report - {period}</h2>
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
            <h1 className="text-3xl font-bold text-[#a33700]">{period} Financial Report</h1>
            <p className="text-[#6b7280]"> Hospitality Competence Center Africa</p>
            <p className="text-[#6b7280] text-sm">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Executive Summary */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#111827] mb-4 border-b border-[#d1d5db] pb-2">Executive Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#dbeafe] p-4 rounded-lg border border-[#3B82F6]">
                <h3 className="font-semibold text-[#1e40af] text-lg">Expected Fee</h3>
                <p className="text-2xl font-bold text-[#1e40af]">KES {(studentFees.expectedTotal || 0).toLocaleString()}</p>
                <p className="text-sm text-[#1e40af] mt-2">From {studentFees.studentCount || 0} students</p>
              </div>
              <div className="bg-[#ffedd5] p-4 rounded-lg border border-[#cc4400]">
                <h3 className="font-semibold text-[#a33700] text-lg">Fee Collected This Month</h3>
                <p className="text-2xl font-bold text-[#a33700]">KES {(studentFees.totalCollected || 0).toLocaleString()}</p>
                <p className="text-sm text-[#a33700] mt-2">{receiptDetails.length} receipts</p>
              </div>
              <div className="bg-[#fee2e2] p-4 rounded-lg border border-[#dc2626]">
                <h3 className="font-semibold text-[#dc2626] text-lg">Total Expenses</h3>
                <p className="text-2xl font-bold text-[#dc2626]">KES {(summary.totalExpenses || 0).toLocaleString()}</p>
                <p className="text-sm text-[#dc2626] mt-2">
                  {(staffExpenses.staffCount || 0) + (tutorExpenses.tutorCount || 0)} employees
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${(summary.netProfit || 0) >= 0 ? 'bg-[#f0f9ff] border-[#0ea5e9]' : 'bg-[#fef3c7] border-[#d97706]'}`}>
                <h3 className={`font-semibold text-lg ${(summary.netProfit || 0) >= 0 ? 'text-[#0ea5e9]' : 'text-[#d97706]'}`}>
                  Net {(summary.netProfit || 0) >= 0 ? 'Profit' : 'Loss'}
                </h3>
                <p className={`text-2xl font-bold ${(summary.netProfit || 0) >= 0 ? 'text-[#0ea5e9]' : 'text-[#d97706]'}`}>
                  KES {Math.abs(summary.netProfit || 0).toLocaleString()}
                </p>
                <p className={`text-sm mt-2 ${(summary.netProfit || 0) >= 0 ? 'text-[#0ea5e9]' : 'text-[#d97706]'}`}>
                  Collection: {(studentFees.collectionRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Cash Flow Summary */}
            <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] my-10">
              <h3 className="text-lg font-semibold text-[#111827] mb-3">Cash Flow Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#a33700]">KES {(studentFees.totalCollected || 0).toLocaleString()}</div>
                  <div className="text-sm text-[#374151]">Cash In (Receipts)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#dc2626]">
                    KES {((invoiceExpenses.total || 0) + (billExpenses.total || 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#374151]">Cash Out (Bills & Invoices)</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${(summary.netCashFlow || 0) >= 0 ? 'text-[#a33700]' : 'text-[#dc2626]'}`}>
                    KES {Math.abs(summary.netCashFlow || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#374151]">Net Cash Flow</div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Analysis - Receipt Based */}
          <div className="mb-15">
            <h2 className="text-2xl font-bold text-[#111827] mb-8 border-b border-[#d1d5db] pb-4">Revenue Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Fee Performance */}
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Fee Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#374151]">Expected Fees:</span>
                    <span className="font-semibold text-[#3B82F6]">KES {(studentFees.expectedTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#374151]">Collected Fees:</span>
                    <span className="font-semibold text-[#ea580c]">KES {(studentFees.totalCollected || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#374151]">Pending Collection:</span>
                    <span className="font-semibold text-[#F59E0B]">KES {(studentFees.totalPending || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-4">
                    <div 
                      className="bg-[#ea580c] h-4 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((studentFees.collectionRate || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-[#6b7280]">
                    <span>0%</span>
                    <span className="font-semibold">Collection Rate: {(studentFees.collectionRate || 0).toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Student Overview */}
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Student Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Total Active Students:</span>
                    <span className="font-semibold text-[#374151]">{studentFees.studentCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Receipts Processed:</span>
                    <span className="font-semibold text-[#374151]">{receiptDetails.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Average Fee per Student:</span>
                    <span className="font-semibold text-[#374151]">
                      KES {studentFees.studentCount > 0 ? 
                        Math.round((studentFees.expectedTotal || 0) / studentFees.studentCount).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Average Collection per Receipt:</span>
                    <span className="font-semibold text-[#374151]">
                      KES {receiptDetails.length > 0 ? 
                        Math.round((studentFees.totalCollected || 0) / receiptDetails.length).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Payment Status is displayed at the end of the report (moved) */}

          {/* Expense Analysis */}
          <div className="mb-15">
            <h2 className="text-2xl font-bold text-[#111827] mb-8 border-b border-[#d1d5db] pb-4">Expense Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Personnel Expenses */}
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Personnel Costs</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#374151]">Staff Salaries:</span>
                      <span className="font-semibold text-[#dc2626]">KES {(staffExpenses.totalSalaries || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] pl-2">
                      {staffExpenses.staffCount || 0} staff members
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#374151]">Tutor Salaries:</span>
                      <span className="font-semibold text-[#dc2626]">KES {(tutorExpenses.totalSalaries || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] pl-2">
                      {tutorExpenses.tutorCount || 0} tutors
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Bonuses:</span>
                    <span className="font-semibold text-[#dc2626]">
                      KES {((staffExpenses.totalBonuses || 0) + (tutorExpenses.totalBonuses || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#e5e7eb] pt-2">
                    <span className="text-[#374151] font-semibold">Total Personnel:</span>
                    <span className="font-bold text-[#dc2626]">
                      KES {((staffExpenses.total || 0) + (tutorExpenses.total || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Expenses */}
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Operational Costs</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#374151]">Bills:</span>
                      <span className="font-semibold text-[#dc2626]">KES {(billExpenses.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] pl-2">
                      {billExpenses.count || 0} bills ({billExpenses.paid || 0} paid, {billExpenses.pending || 0} pending)
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#374151]">Invoices:</span>
                      <span className="font-semibold text-[#dc2626]">KES {(invoiceExpenses.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] pl-2">
                      {invoiceExpenses.count || 0} invoices ({invoiceExpenses.paid || 0} paid, {invoiceExpenses.pending || 0} pending)
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-[#e5e7eb] pt-2">
                    <span className="text-[#374151] font-semibold">Total Operational:</span>
                    <span className="font-bold text-[#dc2626]">
                      KES {((billExpenses.total || 0) + (invoiceExpenses.total || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Distribution */}
            {totalExpenses > 0 && (
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] mb-20">
                <h3 className="text-lg font-semibold text-[#111827] mb-4">Expense Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {expenseData
                    .filter(item => item.value > 0)
                    .map((item, index) => {
                      const percentage = (item.value / totalExpenses) * 100;
                      return (
                        <div key={index} className="text-center">
                          <div className="text-sm text-[#374151] mb-1">{item.name}</div>
                          <div className="text-lg font-bold text-[#dc2626]">
                            KES {item.value.toLocaleString()}
                          </div>
                          <div className="text-xs text-[#6b7280]">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Document Status Overview */}
          <div className="mb-15">
            <h2 className="text-2xl font-bold text-[#111827] mb-4 border-b border-[#d1d5db] pb-2">Document Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Invoices</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Total Amount:</span>
                    <span className="font-semibold text-[#374151]">KES {(invoiceExpenses.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Paid:</span>
                    <span className="font-semibold text-[#ea580c]">{invoiceExpenses.paid || 0} documents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Pending:</span>
                    <span className="font-semibold text-[#FFC107]">{invoiceExpenses.pending || 0} documents</span>
                  </div>
                  {invoiceExpenses.count > 0 && (
                    <div className="w-full bg-[#e5e7eb] rounded-full h-2 mt-2">
                      <div
                        className="bg-[#ea580c] h-2 rounded-full"
                        style={{ width: `${((invoiceExpenses.paid || 0) / (invoiceExpenses.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#111827] mb-3">Bills</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Total Amount:</span>
                    <span className="font-semibold text-[#374151]">KES {(billExpenses.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Paid:</span>
                    <span className="font-semibold text-[#ea580c]">{billExpenses.paid || 0} documents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">Pending:</span>
                    <span className="font-semibold text-[#FFC107]">{billExpenses.pending || 0} documents</span>
                  </div>
                  {billExpenses.count > 0 && (
                    <div className="w-full bg-[#e5e7eb] rounded-full h-2 mt-2">
                      <div
                        className="bg-[#ea580c] h-2 rounded-full"
                        style={{ width: `${((billExpenses.paid || 0) / (billExpenses.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111827] mb-4 border-b border-[#d1d5db] pb-2">Key Performance Indicators</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#f0f9ff] rounded-lg border border-[#0ea5e9]">
                <div className="text-2xl font-bold text-[#0ea5e9]">
                  {studentFees.totalCollected > 0 ? ((summary.netProfit / studentFees.totalCollected) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-[#374151]">Profit Margin</div>
              </div>
              <div className="text-center p-4 bg-[#fff7ed] rounded-lg border border-[#cc4400]">
                <div className="text-2xl font-bold text-[#cc4400]">
                  KES {studentFees.studentCount > 0 ? 
                    Math.round((studentFees.totalCollected || 0) / studentFees.studentCount).toLocaleString() : 0}
                </div>
                <div className="text-sm text-[#374151]">Revenue per Student</div>
              </div>
              <div className="text-center p-4 bg-[#fef7cd] rounded-lg border border-[#d97706]">
                <div className="text-2xl font-bold text-[#d97706]">
                  {studentFees.expectedTotal > 0 ? 
                    ((studentFees.totalPending / studentFees.expectedTotal) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-[#374151]">Fee Collection Gap</div>
              </div>
              <div className="text-center p-4 bg-[#fef2f2] rounded-lg border border-[#dc2626]">
                <div className="text-2xl font-bold text-[#dc2626]">
                  {studentFees.totalCollected > 0 ? 
                    (((staffExpenses.total || 0) + (tutorExpenses.total || 0)) / studentFees.totalCollected * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-[#374151]">Personnel Cost Ratio</div>
              </div>
            </div>
          </div>

          {/* Student Payment Status (full-width sections, placed at end of report) */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#111827] mb-4 border-b border-[#d1d5db] pb-2">Student Payment Status</h2>

            {/* Completed */}
            <div className="bg-[#f8fafc] p-6 rounded-lg border border-[#e2e8f0] mb-6">
              <h3 className="text-lg font-semibold mb-4">Perfectly Completed ({completedStudents.length})</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th>Name</th>
                    <th>Course</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {completedStudents.map(s => (
                    <tr key={s.admissionNumber} className="border-t">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.course}</td>
                      <td className="py-2 text-right">KES {s.paid.toLocaleString()}</td>
                      <td className="py-2 text-right">KES {Math.max(0, s.balance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pending */}
            <div className="bg-[#fff7ed] p-6 rounded-lg border border-[#f59e0b] mb-6">
              <h3 className="text-lg font-semibold mb-4">Pending Balance Students ({pendingStudents.length})</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th>Name</th>
                    <th>Course</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map(s => (
                    <tr key={s.admissionNumber} className="border-t">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.course}</td>
                      <td className="py-2 text-right">KES {s.paid.toLocaleString()}</td>
                      <td className="py-2 text-right">KES {s.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conflicts */}
            <div className="bg-[#fff1f2] p-6 rounded-lg border border-[#fca5a5] mb-6">
              <h3 className="text-lg font-semibold mb-4">Fee Conflicts (Overpaid) ({conflictStudents.length})</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th>Name</th>
                    <th>Course</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Overpaid</th>
                  </tr>
                </thead>
                <tbody>
                  {conflictStudents.map(s => (
                    <tr key={s.admissionNumber} className="border-t">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.course}</td>
                      <td className="py-2 text-right">KES {s.paid.toLocaleString()}</td>
                      <td className="py-2 text-right">KES {(s.paid - s.expected).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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

export default FinancialReportPDF