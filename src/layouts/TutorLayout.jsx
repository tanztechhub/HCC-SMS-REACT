import TutorSidebar from "../tutorPage/tutorSidebar/TutorSidebar";
import TutorTopNav from "../tutorPage/tutorTopNav/TutorTopNav";

export default function TutorLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-200">
      <TutorSidebar />
      <main className="lg:ml-64">
      <TutorTopNav />
        {children}
      </main>
    </div>
  )
}


