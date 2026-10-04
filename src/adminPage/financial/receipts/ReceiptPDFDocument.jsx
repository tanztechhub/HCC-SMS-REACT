import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    logo: { width: 70, height: 70, objectFit: "contain" },
    companyInfo: { fontSize: 9, marginTop: 3, color: "#374151" },
    headerRight: { alignItems: "flex-end" },
    title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    table: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, marginBottom: 24 },
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    rowLast: { flexDirection: "row" },
    cellLabel: { width: "35%", padding: 8, fontFamily: "Helvetica-Bold", backgroundColor: "#f9fafb" },
    cellValue: { flex: 1, padding: 8, backgroundColor: "#f9fafb" },
    contactSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    contactRow: { flexDirection: "row", justifyContent: "space-between" },
    contactRight: { alignItems: "flex-end" },
    footer: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#6b7280", fontSize: 8, color: "#9a3412", textAlign: "center" },
})

const logoUrl = new URL("/wordmark.png", window.location.origin).href

const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString()
}

const formatAmount = (amount) => {
    const n = Number(amount)
    return isNaN(n) ? "0" : n.toLocaleString()
}

export default function ReceiptPDFDocument({ receipt }) {
    const rows = [
        ["Name:", receipt.name],
        ["ADMN Number:", receipt.admnNumber],
        ["Course Enrolled:", receipt.courseEnrolled || "—"],
        ["National ID:", receipt.nationalIdNumber],
        ["Amount Paid:", `KES ${formatAmount(receipt.totalAmountDue)}`],
        ["Payment Method:", receipt.paymentMethod || "—"],
        ...(receipt.transactionCode ? [["Transaction Code:", receipt.transactionCode]] : []),
        ["Remaining Amount:", `KES ${formatAmount(receipt.totalAmountRemaining)}`],
    ]

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Image src={logoUrl} style={styles.logo} />
                        <Text style={styles.companyInfo}>HCC address pending</Text>
                        <Text style={styles.companyInfo}>Nairobi</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>RECEIPT</Text>
                        <Text style={styles.companyInfo}>No: {receipt.receiptNumber}</Text>
                        <Text style={styles.companyInfo}>Date: {formatDate(receipt.date)}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    {rows.map(([label, value], i) => (
                        <View key={label} style={i === rows.length - 1 ? styles.rowLast : styles.row}>
                            <Text style={styles.cellLabel}>{label}</Text>
                            <Text style={styles.cellValue}>{value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.contactSection}>
                    <View style={styles.contactRow}>
                        <View>
                            <Text>Call/Text:</Text>
                            <Text>HCC contact pending</Text>
                            <Text>HCC contact pending</Text>
                        </View>
                        <View style={styles.contactRight}>
                            <Text>Contact HCC administration</Text>
                            <Text>HCC portal link pending</Text>
                            <Text>Postal address pending</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text>Thank you for choosing Hospitality Competence Center Africa.</Text>
                        <Text>For any queries, please contact us at Contact HCC administration</Text>
                        <Text>HCC contact pending | HCC contact pending</Text>
                        <Text>HCC address pending</Text>
                        <Text>Postal address pending</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
