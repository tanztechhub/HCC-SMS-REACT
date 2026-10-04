import { CircularProgress } from "@mui/material"

export default function LoadingSpinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <CircularProgress size={size} style={{ color: "#ffff" }} />
    </div>
  )
}

