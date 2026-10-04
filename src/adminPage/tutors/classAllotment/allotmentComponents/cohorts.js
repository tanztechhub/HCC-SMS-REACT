export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        // TODO: Replace with actual database query
        const cohorts = [
          { id: 1, startDate: "2023-06-05", studentCount: 10 },
          { id: 2, startDate: "2023-06-12", studentCount: 15 },
          // Add more cohorts as needed
        ]
        res.status(200).json(cohorts)
      } catch (error) {
        res.status(500).json({ message: "Error fetching cohorts" })
      }
    } else {
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
  
  