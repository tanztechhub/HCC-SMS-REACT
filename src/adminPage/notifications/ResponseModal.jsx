import { useState } from "react";
import { FiX } from "react-icons/fi";

const ResponseModal = ({ isOpen, onClose, onSubmit, feedback }) => {
    const [response, setResponse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(feedback._id, response);
        setIsSubmitting(false);
        setResponse(""); // Clear for next use
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FiX size={24} />
                </button>
                <h3 className="text-lg font-bold mb-2">Respond to Feedback</h3>
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm font-semibold">{feedback.student.firstName} {feedback.student.lastName}</p>
                    <p className="text-xs text-gray-500 italic">"{feedback.message}"</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full p-2 border border-gray-300 outline-none rounded-md h-32 focus:ring-2 focus:ring-[#9a3412]/50 focus:outline-none"
                        required
                    />
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md mr-2 hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#9a3412] text-white rounded-md hover:bg-[#c2410c] disabled:bg-gray-400">
                            {isSubmitting ? 'Sending...' : 'Send Response'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResponseModal;