export default function ImportedStudentDetails({ source }) {
  if (!source) return null
  return (
    <div className="mb-5 border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Masterlist details</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div><dt className="text-gray-500">Cohort</dt><dd>{source.cohort || "-"}</dd></div>
        <div><dt className="text-gray-500">Exam result</dt><dd>{source.result || "-"}</dd></div>
        <div><dt className="text-gray-500">Company</dt><dd>{source.company || "-"}</dd></div>
        <div><dt className="text-gray-500">Certificate collection</dt><dd>{source.certificateCollection || "-"}</dd></div>
        <div className="col-span-2"><dt className="text-gray-500">Notes</dt><dd>{source.notes || "-"}</dd></div>
      </dl>
      {source.warnings?.length > 0 && <p className="mt-3 text-xs text-amber-700">{source.warnings.join(". ")}{source.originalDateOfBirth != null && source.warnings.some((warning) => warning.includes("birth")) ? ` (source value: ${source.originalDateOfBirth})` : ""}</p>}
    </div>
  )
}
