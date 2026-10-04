import { CircleHelp, Globe, Phone } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FiFacebook } from "react-icons/fi";

export function StudentFooter() {
    return (
        <footer className="bg-white shadow-lg py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-md:pl-8">
                <div className="flex justify-between items-center max-md:flex-col gap-4 max-md:items-start">
                    <div>
                        <div className="flex items-center gap-4 font-extrabold">
                        <img src="/wordmark.png" alt="HCC" className="h-10 mb-2" />
                        <span className="text-3xl text-orange-700">HCC</span>
                        </div>
                        <p>@HCC 2025 | All rights Reserved</p>
                    </div>
                    <div className="flex gap-8 items-center max-md:flex-col max-md:items-start">
                        <div>
                            <p className="text-gray-800 font-bold flex items-center">Need Help <CircleHelp height={15} /></p>
                            <span className="flex gap-2 text-gray-500 text-2xl mt-1">
                                <FiFacebook />
                                <FaInstagram />
                                <FaXTwitter />
                                <BsWhatsapp />
                            </span>
                        </div>
                        <div>
                            <span className="flex items-center gap-2">
                                <Phone height={15} />
                                <a className="font-semibold text-gray-800" href="#contact-information">HCC contact pending / HCC contact pending</a>
                            </span>
                            <span className="flex items-center gap-2">
                                <Globe height={15} />
                                <a className="font-semibold text-gray-800" href="#contact-information">HCC portal link pending</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

