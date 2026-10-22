export default function CourseCard({ course }) {
  const seatsLeft = course.capacity - course.enrolledCount;
  return (
    <article className="card">
      <h3>{course.title}</h3>
      <p>
        <span className="badge">{course.category}</span> {course.level} · {course.durationHours}h
      </p>
      <p>{course.description}</p>
      <p className={seatsLeft <= 0 ? 'full' : ''}>{seatsLeft <= 0 ? 'Full' : `${seatsLeft} seats left`}</p>
    </article>
  );
}
