import { StudentFooter } from "../studentPage/components/studentFooter/StudentFooter";
import { StudentTopNav } from "../studentPage/components/studentTopNav/StudentTopNav";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-200">
      <StudentTopNav />
      <main>
        {children}
      </main>
      <StudentFooter />
    </div>
  )
}