export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        // TODO: Replace with actual database query
        const tutors = [
          { id: 1, name: "John Doe", specialization: "Math", currentStudents: 5 },
          { id: 2, name: "Jane Smith", specialization: "Science", currentStudents: 3 },
          // Add more tutors as needed
        ]
        res.status(200).json(tutors)
      } catch (error) {
        res.status(500).json({ message: "Error fetching tutors" })
      }
    } else {
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
  
  