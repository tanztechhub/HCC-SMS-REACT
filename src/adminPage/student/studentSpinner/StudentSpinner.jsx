export default function StudentSpinner({ size = 24 }) {
    return (
      <div className="flex justify-center items-center">
        <div
          className={`animate-spin rounded-full border-t-2 border-b-2 border-[#fb923c]`}
          style={{ width: `${size}px`, height: `${size}px` }}
        ></div>
      </div>
    )
  }
  
  