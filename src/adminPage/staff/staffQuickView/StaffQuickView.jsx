"use client"

import { User, X } from "lucide-react"
import { MdPerson } from "react-icons/md"

export default function StaffQuickView({ isOpen, onClose, staff }) {
    if (!isOpen || !staff) return null

    return (
        <div className="fixed inset-0 bg-orange-700/20 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-700">
                        <i className='bg-orange-700 rounded-full text-white p-1 flex items-center justify-center'>
                            <MdPerson />
                        </i>
                        {staff.firstName} {staff.lastName}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-center">
                        {staff.profilePicture ? (
                            <img
                                src={staff.profilePicture}
                                alt={staff.name}
                                className="w-32 h-32 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-25 h-25 text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-orange-900">Role</h3>
                        <p>{staff.role}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900">Email</h3>
                        <p>{staff.email}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900">Phone</h3>
                        <p>{staff.phone}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900">KRA PIN</h3>
                        <p>{staff.kra}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

