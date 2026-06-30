import CourseViewerClient from './CourseViewerClient';

// Pre-define dynamic params for courses 1 to 5 to satisfy Next.js static HTML export requirement
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function CourseViewerPage() {
  return <CourseViewerClient />;
}
