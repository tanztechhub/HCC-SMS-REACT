"use client"

const Block = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`} />
)

export default function ReportSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Block key={i} className="h-24" />
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Block key={i} className="h-20" />
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Block key={i} className="h-20" />
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mb-2" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        </div>
    )
}
