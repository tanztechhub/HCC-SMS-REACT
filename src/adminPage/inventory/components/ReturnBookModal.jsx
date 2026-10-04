"use client";

import { useState } from "react";
import { X, Search, Loader2, User, Check, CheckCheck, DollarSign } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReturnBookModal({ onClose }) {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [returning, setReturning] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [processingPayments, setProcessingPayments] = useState({});

  const searchStudent = async () => {
    if (!admissionNumber.trim()) {
      setError("Please enter an admission number.");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/inventory/student/${admissionNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        throw new Error("Student not found.");
      }

      const data = await response.json();
      setStudent(data.data);
      
      // Initialize payment amounts for books with accrued fees
      const initialPaymentAmounts = {};
      data.data.borrowedBooks.forEach(book => {
        if (book.accruedFee > 0) {
          initialPaymentAmounts[book._id] = "";
        }
      });
      setPaymentAmounts(initialPaymentAmounts);
    } catch (error) {
      setError(error.message);
      setStudent(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReturn = async (bookId, studentBookId) => {

    if (!student) return;

    setReturning(true);

    try {
      const response = await fetch(`${API_URL}/inventory/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ studentId: student._id, inventoryId: bookId, studentBookId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to return book.");
      }

      toast.success("Book returned successfully.");
      
      // Update the student data to reflect the returned book
      const updatedStudent = {...student};
      const bookIndex = updatedStudent.borrowedBooks.findIndex(book => book._id === studentBookId);
      if (bookIndex !== -1) {
        updatedStudent.borrowedBooks[bookIndex].returnDate = new Date().toISOString();
      }
      setStudent(updatedStudent);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReturning(false);
    }
  };

  const handlePaymentChange = (bookId, value) => {
    // Only allow numbers and decimal points
    const validValue = value.replace(/[^0-9.]/g, '');
    setPaymentAmounts({
      ...paymentAmounts,
      [bookId]: validValue
    });
  };

  const handlePayFee = async (bookId, studentBookId, returnDate) => {
    if(!returnDate){
      toast.error("Please Return Book Before Updating Accrued Fee")
      return;
    }
    const amount = parseFloat(paymentAmounts[studentBookId]);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount to pay.");
      return;
    }

    // Set loading state for this specific payment
    setProcessingPayments({
      ...processingPayments,
      [studentBookId]: true
    });

    try {
      const response = await fetch(`${API_URL}/inventory/bookfee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          studentId: student._id,
          inventoryId: bookId,
          studentBookId,
          amount
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process payment.");
      }

      toast.success(`Payment of Ksh. ${amount} processed successfully.`);
      
      // Update the student data to reflect the paid fee
      const updatedStudent = {...student};
      const bookIndex = updatedStudent.borrowedBooks.findIndex(book => book._id === studentBookId);
      if (bookIndex !== -1) {
        const currentFee = updatedStudent.borrowedBooks[bookIndex].accruedFee;
        updatedStudent.borrowedBooks[bookIndex].accruedFee = Math.max(0, currentFee - amount);
      }
      setStudent(updatedStudent);
      
      // Reset payment amount for this book
      setPaymentAmounts({
        ...paymentAmounts,
        [studentBookId]: ""
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingPayments({
        ...processingPayments,
        [studentBookId]: false
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-800/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl overflow-y-scroll max-h-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Return Book</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Admission Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="block w-full pr-10 border-2 p-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                placeholder="Enter admission number"
              />
              <button
                onClick={searchStudent}
                disabled={isSearching}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <Search className="h-7 w-8 text-white cursor-pointer bg-orange-500/80 p-1 rounded-sm" />
                )}
              </button>
            </div>
            {error && <p className="mt-1 text-sm font-semibold text-red-600 bg-red-400/25 p-2 rounded-md">{error}</p>}
          </div>

          {student && (
            <div className="border-2 border-gray-300 rounded-md p-4">
              <h4 className="font-medium text-orange-900 mb-2">Student Details</h4>
              <div className="flex items-center gap-4">
                {student.profileImage ? (
                  <img src={student.profileImage} alt={student.firstName} className="rounded-full h-15 w-15" />
                ) : (
                  <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <span className="w-full">
                  <p className="flex justify-between"><span>Name:</span> <span>{student.firstName} {student.lastName}</span></p>
                  <p className="flex justify-between"><span>Course:</span> <span>{student.courseName}</span></p>
                  <p className="flex justify-between"><span>Contact:</span><span>{student.phoneNumber}</span></p>
                </span>
              </div>
            </div>
          )}

          {student?.borrowedBooks?.length > 0 && (
            <div className="border-2 border-gray-300 rounded-md p-4 mt-4">
              <h4 className="font-medium text-orange-900 mb-2">Borrowed Books</h4>
              {student.borrowedBooks.map((book) => (
                <div key={book._id} className="border-b-2 border-b-gray-300 pb-3 last:border-b-0 mt-4">
                  <div className="flex items-center gap-4">
                    {book.itemId.imageUrl ? (
                      <img src={book.itemId.imageUrl} alt={book.itemId.name} className="w-16 h-16 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{book.itemId.name}</p>
                      <p className="text-sm text-gray-500">
                        <span className="text-orange-950 font-semibold">Borrowed On:</span>  {format(new Date(book.dateBorrowed), "EEEE, MMMM do yyyy, h:mm a")}
                      </p>
                      {book.returnDate && (
                        <p className="text-sm text-gray-500">
                          <span className="text-orange-950 font-semibold">Returned On:</span> {format(new Date(book.returnDate), "EEEE, MMMM do yyyy, h:mm a")}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        <span className="text-orange-950 font-semibold">Accrued Fee: </span> 
                        <span className={`font-bold ${book.accruedFee > 0 ? 'text-red-500' : 'text-orange-400'}`}>
                          Ksh. {book.accruedFee}
                        </span>
                      </p>
                    </div>
                    {!book.returnDate ? (
                      <button
                        onClick={() => handleReturn(book.itemId._id, book._id)}
                        disabled={returning}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
                      >
                        {returning ? "Returning..." : "Return"}
                      </button>
                    ) : (
                      <div className="border-2 border-gray-400 bg-gray-300 p-2 rounded-md text-gray-600 cursor-not-allowed flex gap-2 items-center">
                        <CheckCheck className="h-5"/>
                        Returned
                      </div>
                    )}
                  </div>
                  
                  {/* Fee Payment Section - shown for books with accrued fees */}
                  {book.accruedFee > 0 && (
                    <div className="mt-3 ml-20 bg-amber-50 p-3 rounded-md border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-2">Pay Accrued Fee</p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            Ksh.
                          </span>
                          <input
                            type="text"
                            value={paymentAmounts[book._id] || ""}
                            onChange={(e) => handlePaymentChange(book._id, e.target.value)}
                            placeholder="Enter amount"
                            className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          />
                        </div>
                        <button
                          onClick={() => handlePayFee(book.itemId._id, book._id, book.returnDate)}
                          disabled={processingPayments[book._id]}
                          className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 cursor-pointer"
                        >
                          {processingPayments[book._id] ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-1" />
                              Pay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}