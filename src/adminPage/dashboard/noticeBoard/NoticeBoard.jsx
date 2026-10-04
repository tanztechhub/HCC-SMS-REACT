import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Book, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom"

export default function NoticeBoard() {
  const [todaysActivities, setTodaysActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todaysDate, setTodaysDate] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/timetables/`);
        const result = await response.json();
        
        if (result.success) {
          // Get today's date in YYYY-MM-DD format
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          setTodaysDate(todayStr);
          
          let allActivities = [];
          
          // Process all cohorts
          result.data.forEach(cohort => {
            // Process lessons
            if (cohort.lessons) {
              cohort.lessons.forEach(lesson => {
                const lessonDate = new Date(lesson.date).toISOString().split('T')[0];
                if (lessonDate === todayStr) {
                  allActivities.push({
                    type: 'lesson',
                    date: lesson.date,
                    startTime: lesson.startTime,
                    endTime: lesson.endTime,
                    title: lesson.topic,
                    venue: lesson.venue,
                    tutor: cohort.tutorName || 'Unknown Tutor'
                  });
                }
              });
            }

            // Process exams
            if (cohort.exams) {
              cohort.exams.forEach(exam => {
                const examDate = new Date(exam.examDate).toISOString().split('T')[0];
                if (examDate === todayStr) {
                  allActivities.push({
                    type: 'exam',
                    date: exam.examDate,
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    title: exam.examName,
                    venue: exam.venue,
                    invigilator: exam.invigilatorId
                  });
                }
              });
            }
            
            // Process events
            if (cohort.events) {
              cohort.events.forEach(event => {
                const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
                if (eventDate === todayStr) {
                  allActivities.push({
                    type: 'event',
                    date: event.eventDate,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    title: event.eventDescription,
                    venue: event.venue,
                    organizer: event.organizerId
                  });
                }
              });
            }
          });
          
          // Sort activities by start time
          allActivities.sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
          });
          
          setTodaysActivities(allActivities);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <Book className="h-4 w-4" />;
      case 'exam':
        return <FileText className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'event':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatTime = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getFormattedDate = () => {
    const today = new Date();
    const options = { day: "numeric", month: "short", year: "numeric" }; // Format: "26, Feb 2025"
    return today.toLocaleDateString("en-US", options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-[#cc4400]">
        Today's Events: <span className='font-bold'>{getFormattedDate()}</span>
      </h2>
      <NavLink to={"/admin-dashboard/exam-timetable-management"} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-800 transition-colors">
        <Plus className="h-5 w-5" />
        ADD
      </NavLink>
    </div>

      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          {todaysActivities.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No activities scheduled for today</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">TYPE</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">TIME</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">TITLE</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">VENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {todaysActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-300">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                        {getTypeIcon(activity.type)}
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 max-w-64">
                      <span className='line-clamp-2'>{activity.title}</span> 
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {activity.venue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}