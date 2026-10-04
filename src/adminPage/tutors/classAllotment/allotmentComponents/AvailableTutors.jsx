export default function AvailableTutors({ tutors }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Tutors</h2>
        {tutors.map((tutor) => (
          <div key={tutor.id} className="mb-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium text-gray-800">{tutor.name}</h3>
            <p className="text-gray-600">Specialization: {tutor.specialization}</p>
            <p className="text-gray-600">Current Students: {tutor.currentStudents}</p>
          </div>
        ))}
      </div>
    )
  }
  
  