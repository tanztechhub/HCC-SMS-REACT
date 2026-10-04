import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    logo: { width: 150, height: 67, objectFit: "contain" },
    logoCaption: { fontSize: 9, color: "#9a3412", marginTop: 2 },
    headerRight: { alignItems: "flex-end" },
    title: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#cc4400" },
    dateLine: { fontSize: 9, marginTop: 2 },
    subtitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 6 },
    paragraph: { marginBottom: 4, lineHeight: 1.4 },
    bold: { fontFamily: "Helvetica-Bold", color: "#9a3412" },
    section: { marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6 },
    infoRow: { flexDirection: "row", marginBottom: 4 },
    infoLabel: { width: "45%", color: "#9a3412" },
    infoValue: { flex: 1, fontFamily: "Helvetica-Bold" },
    bulletRow: { flexDirection: "row", marginBottom: 3 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1, lineHeight: 1.4 },
    footer: { marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#6b7280", fontSize: 8, color: "#9a3412", textAlign: "center" },
})

const logoUrl = new URL("/wordmark.png", window.location.origin).href

const formatDate = (date) => {
    if (!date) return "N/A"
    const d = new Date(date)
    return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString()
}

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
)

export default function AdmissionLetterPDFDocument({ student }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Image src={logoUrl} style={styles.logo} />
                        <Text style={styles.logoCaption}>Training Center</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>ENROLLMENT CONFIRMATION</Text>
                        <Text style={styles.dateLine}>Date: {new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                <Text style={styles.subtitle}>Dear {student.firstName} {student.lastName},</Text>
                <Text style={styles.paragraph}>
                    We are pleased to inform you that you have been successfully enrolled in the{" "}
                    <Text style={styles.bold}>{student.courseName}</Text> course at the Hospitality Competence Center Africa.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Student Information</Text>
                    <InfoRow label="Admission Number:" value={student.admissionNumber} />
                    <InfoRow label="Name:" value={`${student.firstName} ${student.lastName}`} />
                    <InfoRow label="Email:" value={student.email} />
                    <InfoRow label="Phone Number:" value={student.phoneNumber} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Course Details</Text>
                    <InfoRow label="Course:" value={student.courseName} />
                    <InfoRow label="Duration:" value={student.courseDuration} />
                    <InfoRow label="Total Fee:" value={`KES ${Number(student.courseFee || 0).toLocaleString()}`} />
                    <InfoRow label="Upfront Fee Paid:" value={`KES ${Number(student.upfrontFee || 0).toLocaleString()}`} />
                    <InfoRow label="Start Date:" value={formatDate(student.startDate)} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Important Information</Text>
                    {[
                        "Visit HCC portal link pending to access your student portal",
                        "Please use your phone number as your initial password to log into your student portal.",
                        "You are encouraged to change your password once you log in.",
                        "Students are expected to attend at least 75% of the course classes.",
                    ].map((text) => (
                        <View key={text} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{text}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <Text style={styles.paragraph}>Fee payments should be made through:</Text>
                    <InfoRow label="Bank:" value="Bank details pending" />
                    <InfoRow label="Pay Bill:" value="Pending HCC confirmation" />
                    <InfoRow label="Account Number:" value="Pending HCC confirmation" />
                    <InfoRow label="Account Name:" value="Hospitality Competence Center Africa" />
                    <InfoRow label="Branch Name:" value="Branch pending" />
                </View>

                <View style={styles.footer}>
                    <Text>Thank you for choosing Hospitality Competence Center Africa.</Text>
                    <Text>For any queries, please contact us at Contact HCC administration</Text>
                    <Text>HCC contact pending | HCC contact pending</Text>
                    <Text>HCC address pending</Text>
                    <Text>Postal address pending</Text>
                </View>
            </Page>
        </Document>
    )
}
