export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        // TODO: Replace with actual database query
        const unassignedCount = 25 // Example count
        res.status(200).json({ unassignedCount })
      } catch (error) {
        res.status(500).json({ message: "Error fetching statistics" })
      }
    } else {
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
  
  