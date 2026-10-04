import React from "react";
import { Check, X, AlertTriangle, BookOpen, GraduationCap } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";

const GraduationModal = ({ student, isOpen, onClose, onGraduate, isLoading }) => {
  if (!isOpen || !student) return null;

  // Check fee status
  const feeDifference = student.upfrontFee - student.courseFee;
  const hasFeeConflict = Math.abs(feeDifference) > 100;
  const feeStatus = getFeeStatus(student);

  // Check grades
  const missingGrades = student.exams.some(exam => exam.score === null || exam.score === undefined || exam.score === 0);

  // Check borrowed books
  const unreturnedBooks = student.borrowedBooks?.filter(book => book.returnDate === null) || [];
  const hasUnreturnedBooks = unreturnedBooks.length > 0;

  // Check accrued fees
  const hasAccruedFees = student.borrowedBooks?.some(book => book.accruedFee > 0) || false;

  // Can graduate?
  const canGraduate = !hasFeeConflict && !missingGrades && !hasUnreturnedBooks && !hasAccruedFees;

  // Helper function to safely get a book ID
  const getBookId = (book) => {
    if (!book || !book.itemId) return "Unknown";

    // Handle different possible formats of itemId
    if (typeof book.itemId === "string") {
      return book.itemId.substring(Math.max(0, book.itemId.length - 6));
    } else if (book.itemId.$oid) {
      return book.itemId.$oid.substring(Math.max(0, book.itemId.$oid.length - 6));
    } else if (typeof book.itemId === "object") {
      // Try to get a string representation
      const idStr = JSON.stringify(book.itemId);
      return idStr.substring(Math.max(0, idStr.length - 8)).replace(/['"{}]/g, '');
    }

    return "Unknown";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-orange-700/30 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white h-[90%] overflow-y-scroll rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap />
            Graduation Verification
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Student Profile */}
        <div className="px-6 py-4 border-b border-gray-400">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
              <img
                src={student.profileImage || "/profile/student.jpg"}
                alt={`${student.firstName} ${student.lastName}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-gray-600">{student.admissionNumber}</p>
              <p className="text-sm text-gray-500">Course: {student.courseName}</p>
            </div>
          </div>
        </div>

        {/* Verification Sections */}
        <div className="px-6 py-4 space-y-4">
          {/* Fee Status */}
          <div className="border border-gray-400 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold">Fee Status</div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Course Fee: <span className="font-semibold">{student.courseFee.toLocaleString()} Ksh</span></p>
                  <p>Paid Amount: <span className="font-semibold">{student.upfrontFee.toLocaleString()} Ksh</span></p>
                </div>
                <div className={`${feeStatus.styles} flex items-center gap-2`}>
                  {!hasFeeConflict ? <Check size={18} /> : <AlertTriangle size={18} />}
                  {feeStatus.text}
                </div>
              </div>
            </div>
          </div>

          {/* Grades */}
          <div className="border border-gray-400 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold">Academic Status</div>
            <div className={`p-4 ${missingGrades ? "bg-red-50" : "bg-orange-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Grades</h4>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${missingGrades ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                  }`}>
                  {missingGrades ? <X size={16} /> : <Check size={16} />}
                  {missingGrades ? "Missing Grades" : "All Grades Complete"}
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {student.exams.map((exam, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{exam.name}</span>
                    <span className={`font-medium ${exam.score === null || exam.score === undefined
                        ? "text-red-600"
                        : "text-orange-600"
                      }`}>
                      {exam.score !== null && exam.score !== undefined
                        ? `${exam.score}/${exam.weight}`
                        : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Library Status */}
          <div className="border border-gray-400 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold">Library Status</div>
            <div className={`p-4 ${hasUnreturnedBooks || hasAccruedFees ? "bg-red-50" : "bg-orange-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Borrowed Books</h4>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${hasUnreturnedBooks ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                  }`}>
                  {hasUnreturnedBooks ? <X size={16} /> : <Check size={16} />}
                  {hasUnreturnedBooks ? "Unreturned Books" : "All Books Returned"}
                </div>
              </div>

              {unreturnedBooks.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {unreturnedBooks.map((book, index) => {
                    // Parse the borrowed date
                    const borrowedDate = parseISO(book.dateBorrowed);
                    // Format borrowed date
                    const formattedBorrowedDate = format(borrowedDate, "PPP p"); // Example: "Feb 25, 2025 at 7:01 AM"
                    // Calculate expected return date
                    const expectedReturnDate = format(addDays(borrowedDate, book.allowedDays), "PPP p");

                    return (
                      <div key={index} className="flex items-center gap-2 text-red-600">
                        <span className="flex flex-col">Borrowed: <span>{formattedBorrowedDate}</span></span>
                        <span className="ml-auto flex flex-col">Expected Return: <span>{expectedReturnDate}</span></span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                student.borrowedBooks && student.borrowedBooks.length > 0 ? (
                  <p className="text-orange-600 text-sm">All books have been returned</p>
                ) : (
                  <p className="text-gray-600 text-sm">No books borrowed</p>
                )
              )}

              {/* Accrued Fees */}
              {hasAccruedFees && (
                <div className="mt-4 p-3 bg-red-100 rounded-md text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span className="font-semibold">Unpaid Library Fees</span>
                  </div>
                  <div className="mt-2">
                    {student.borrowedBooks
                      .filter(book => book.accruedFee > 0)
                      .map((book, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Book ID: {getBookId(book)}</span>
                          <span>{book.accruedFee} Ksh</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-800 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onGraduate(student)}
            disabled={!canGraduate || isLoading}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${canGraduate && !isLoading
                ? "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <GraduationCap size={18} />
            )}
            {isLoading ? "Processing..." : "Graduate Student"}
          </button>
        </div>

        {/* Graduation blockers message */}
        {!canGraduate && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                <span className="font-medium">Cannot Graduate Due To:</span>
              </div>
              <ul className="pl-7 mt-2 list-disc text-sm space-y-1">
                {hasFeeConflict && <li>Outstanding fee balance or fee conflict</li>}
                {missingGrades && <li>Missing academic grades</li>}
                {hasUnreturnedBooks && <li>Unreturned library books</li>}
                {hasAccruedFees && <li>Unpaid library fees</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine fee status (copied from main component)
const getFeeStatus = (student) => {
  const difference = student.upfrontFee - student.courseFee;
  if (Math.abs(difference) <= 100) {
    return {
      text: "Completed",
      styles: "text-orange-600 bg-orange-100 px-3 py-1 rounded-md font-semibold"
    };
  } else if (difference < 0) {
    return {
      text: `${difference.toLocaleString()} Ksh`,
      styles: "text-red-600 bg-red-100 px-3 py-1 rounded-md font-semibold"
    };
  } else {
    return {
      text: `+${difference.toLocaleString()} Ksh`,
      styles: "text-amber-600 bg-amber-100 px-3 py-1 rounded-md font-semibold"
    };
  }
};

export default GraduationModal;