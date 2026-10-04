import { pdf } from "@react-pdf/renderer"

// Generates a real, vector PDF (selectable text, no cutoff) instead of the
// old screenshot-based approach, and triggers a browser download of it.
export const downloadPdf = async (doc, filename) => {
    const blob = await pdf(doc).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

// Loads the same PDF into a hidden iframe and triggers the browser's native
// print dialog on it, so print output is the real paginated PDF rather than
// a single stretched screenshot image.
export const printPdf = async (doc) => {
    const blob = await pdf(doc).toBlob()
    const url = URL.createObjectURL(blob)

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "none"
    document.body.appendChild(iframe)

    iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        iframe.contentWindow.onafterprint = () => {
            iframe.remove()
            URL.revokeObjectURL(url)
        }
    }
    iframe.src = url
}
