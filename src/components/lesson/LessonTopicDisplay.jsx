// Renders a lesson's topic(s). A lesson built from the curriculum can cover
// several topics (`curriculumTopics`), each shown bold with its chosen
// sub-topics in a normal-weight list underneath. Lessons saved before
// multi-topic support only have a single topic in `curriculumSectionTitle` /
// `curriculumSubtopics`, and plain lessons only have the flat `topic` string -
// both fall back exactly as before.
const getTopics = (lesson) => {
  if (lesson.curriculumTopics?.length > 0) {
    return lesson.curriculumTopics.map((t) => ({ title: t.sectionTitle, subtopics: t.subtopics || [] }))
  }
  if (lesson.curriculumSectionTitle) {
    return [{ title: lesson.curriculumSectionTitle, subtopics: lesson.curriculumSubtopics || [] }]
  }
  return []
}

export default function LessonTopicDisplay({ lesson, className = "" }) {
  if (!lesson) return null

  const topics = getTopics(lesson)

  if (topics.length > 0) {
    return (
      <div className={`${className} ${topics.length > 1 ? "space-y-2" : ""}`}>
        {topics.map((topic, topicIndex) => (
          <div key={topicIndex}>
            <p className="font-bold capitalize">{topic.title}</p>
            {topic.subtopics.length > 0 && (
              <ul className="list-disc list-inside font-normal text-sm text-gray-600 mt-1">
                {topic.subtopics.map((subtopic, index) => (
                  <li key={index}>{subtopic}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  return <p className={`font-medium capitalize ${className}`}>{lesson.topic}</p>
}
