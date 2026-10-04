const GRADIENTS = {
    blue: "from-indigo-500 to-indigo-700",
    green: "from-orange-500 to-orange-700",
    yellow: "from-amber-500 to-amber-600",
    red: "from-rose-500 to-rose-700",
}

export default function StatsCard({ title, value, icon, description, color = "blue" }) {
    const gradient = GRADIENTS[color] || GRADIENTS.blue

    return (
        <div className={`rounded-2xl p-4 text-white shadow-md bg-gradient-to-br ${gradient}`}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white/90">{title}</p>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">{icon}</span>
                </div>
            </div>
            <p className="text-xl font-bold leading-tight break-words">{value}</p>
            {description && <p className="text-xs text-white/80 mt-1">{description}</p>}
        </div>
    )
}
