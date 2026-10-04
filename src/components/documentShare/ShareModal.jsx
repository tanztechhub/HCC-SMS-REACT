"use client"

import { useState, useEffect } from "react"
import { X, Mail, Loader2 } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import { toast } from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

const normalizePhoneForWhatsApp = (phone) => {
    const digits = (phone || "").replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("254")) return digits
    if (digits.startsWith("0")) return `254${digits.slice(1)}`
    if (digits.length === 9) return `254${digits}`
    return digits
}

// Generic WhatsApp/email share panel for any shareable document (receipt,
// admission letter, ...). The caller supplies the message, the email
// endpoint to POST to, and the admission number to auto-fill contact info from.
export default function ShareModal({ shareUrl, shareMessage, admnNumber, emailEndpoint, onClose }) {
    const [channel, setChannel] = useState("whatsapp")
    const [recipient, setRecipient] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [studentContact, setStudentContact] = useState(null)

    useEffect(() => {
        if (!admnNumber) return
        const fetchStudentContact = async () => {
            try {
                const res = await fetch(`${API_URL}/students/${admnNumber}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
                const data = await res.json()
                if (data.success && data.data) {
                    setStudentContact({ email: data.data.email, phoneNumber: data.data.phoneNumber })
                }
            } catch (error) {
                // Best-effort — the admin can still type a custom recipient.
            }
        }
        fetchStudentContact()
    }, [admnNumber])

    useEffect(() => {
        if (!studentContact) return
        setRecipient(channel === "email" ? (studentContact.email || "") : (studentContact.phoneNumber || ""))
    }, [channel, studentContact])

    const handleWhatsAppShare = () => {
        const phone = normalizePhoneForWhatsApp(recipient)
        if (!phone) {
            toast.error("Enter a valid phone number")
            return
        }
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(shareMessage)}`, "_blank")
        onClose()
    }

    const handleEmailShare = async () => {
        if (!recipient || !recipient.includes("@")) {
            toast.error("Enter a valid email address")
            return
        }
        setIsSending(true)
        try {
            const response = await fetch(emailEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: recipient, shareUrl }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success(`Sent to ${recipient}`)
            onClose()
        } catch (error) {
            toast.error(error.message || "Failed to send email")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-orange-800/25 z-[70] flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-sm p-5 rounded-md shadow-xl">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold">Share Document</h3>
                    <span onClick={onClose}>
                        <X className="h-6 w-6 cursor-pointer" />
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setChannel("whatsapp")}
                        className={`flex items-center justify-center gap-2 py-2 rounded-md border-2 font-medium text-sm cursor-pointer ${channel === "whatsapp" ? "border-orange-600 bg-orange-600 text-white" : "border-gray-300 text-gray-700"
                            }`}
                    >
                        <FaWhatsapp className="h-4 w-4" />
                        WhatsApp
                    </button>
                    <button
                        type="button"
                        onClick={() => setChannel("email")}
                        className={`flex items-center justify-center gap-2 py-2 rounded-md border-2 font-medium text-sm cursor-pointer ${channel === "email" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-700"
                            }`}
                    >
                        <Mail className="h-4 w-4" />
                        Email
                    </button>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {channel === "email" ? "Recipient email" : "Recipient phone number"}
                </label>
                <input
                    type={channel === "email" ? "email" : "tel"}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={channel === "email" ? "student@example.com" : "07XXXXXXXX"}
                    className="w-full border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400"
                />
                <p className="mt-1 text-xs text-gray-500">
                    {studentContact
                        ? "Pre-filled from the student's record — edit to use a different contact."
                        : "No student record found to auto-fill — enter a contact manually."}
                </p>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    {channel === "whatsapp" ? (
                        <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer"
                        >
                            <FaWhatsapp className="h-4 w-4" />
                            Open WhatsApp
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEmailShare}
                            disabled={isSending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSending ? "Sending..." : "Send Email"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
