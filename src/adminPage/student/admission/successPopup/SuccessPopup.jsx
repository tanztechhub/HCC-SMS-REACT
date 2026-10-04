import loadingGif from "/loaders/circular-loaders.gif";
import AdmissionLetterTemplate from "../AdmissionLetterTemplate";
import ReceiptTemplate from "../../../financial/receipts/ReceiptTemplate";
import DocumentAccordionRow from "../../../../components/documentShare/DocumentAccordionRow";

const API_URL = import.meta.env.VITE_API_URL;

export default function PopUp({ isOpen, onClose, status, data }) {
  // If the popup is not open, don't render anything
  if (!isOpen) return null;

  const student = data?.student;
  const receipt = data?.receipt;

  const letterShareUrl = student ? `${window.location.origin}/document/admission/${student.admissionNumber}` : null;
  const receiptShareUrl = receipt ? `${window.location.origin}/document/receipt/${receipt.receiptNumber}` : null;

  return (
    <div className="fixed w-full h-[100vh] top-0 right-0 bg-orange-500/15 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-[750px] max-h-[90vh] overflow-y-auto">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <img src={loadingGif || "/loaders/circular-loaders.gif"} alt="Loading" className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Registering...</p>
          </div>
        )}

        {status === "update" && (
          <div className="flex flex-col items-center">
            <img src={loadingGif || "/loaders/circular-loaders.gif"} alt="Loading" className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Updating...</p>
          </div>
        )}

        {status === "success" && student && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-orange-600">Student Registered Successfully</h2>
              <p className="text-gray-600 mt-1">
                {student.firstName} {student.lastName} &middot; {student.admissionNumber}
              </p>
            </div>

            <DocumentAccordionRow
              title="Admission Letter"
              subtitle={`Enrollment confirmation for ${student.courseName}`}
              containerId="admissionLetterDoc"
              filename={`admission-letter-${student.admissionNumber}.pdf`}
              shareUrl={letterShareUrl}
              shareMessage={`Hi ${student.firstName}, here is your admission letter from Hospitality Competence Center Africa: ${letterShareUrl}`}
              emailEndpoint={`${API_URL}/students/admission-letter/${student.admissionNumber}/share/email`}
              admnNumber={student.admissionNumber}
            >
              <AdmissionLetterTemplate student={student} containerId="admissionLetterDoc" />
            </DocumentAccordionRow>

            {receipt && (
              <DocumentAccordionRow
                title={`Receipt ${receipt.receiptNumber}`}
                subtitle={`Initial payment of KES ${Number(receipt.totalAmountDue || 0).toLocaleString()}`}
                containerId="admissionReceiptDoc"
                filename={`receipt-${receipt.receiptNumber}.pdf`}
                shareUrl={receiptShareUrl}
                shareMessage={`Hi ${receipt.name}, here is your receipt ${receipt.receiptNumber} from Hospitality Competence Center Africa: ${receiptShareUrl}`}
                emailEndpoint={`${API_URL}/receipts/${receipt._id}/share/email`}
                admnNumber={receipt.admnNumber}
              >
                <ReceiptTemplate receipt={receipt} containerId="admissionReceiptDoc" />
              </DocumentAccordionRow>
            )}

            <div className="flex justify-end mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <div>
            <p className="text-lg font-semibold text-red-600 mb-4">Registration Failed</p>
            {data && (
              <div className="bg-red-100 p-4 rounded-lg">
                <p>{data.error}</p>
                {data.details && <p>{JSON.stringify(data.details)}</p>}
              </div>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer mt-4 px-4 py-2 bg-[#cc4400] text-white rounded hover:bg-[#cc4400]/80"
            >
              Close
            </button>
          </div>
        )}

        {status === "updateSuccess" && (
          <div>
            <p className="text-lg font-semibold text-orange-600 mb-4">Student Updated Successfully</p>
            <button
              onClick={onClose}
              className="cursor-pointer mt-4 px-4 py-2 bg-[#cc4400] text-white rounded hover:bg-[#cc4400]/80"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
