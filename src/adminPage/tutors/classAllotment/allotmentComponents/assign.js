export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        const { cohortId, tutorId } = req.body
        // TODO: Implement the actual assignment logic in your database
        // This might involve updating the allotment status for students in the cohort
        // and associating them with the selected tutor
  
        // For now, we'll just return a success message
        res.status(200).json({ message: "Cohort assigned successfully" })
      } catch (error) {
        res.status(500).json({ message: "Error assigning cohort" })
      }
    } else {
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
  
  