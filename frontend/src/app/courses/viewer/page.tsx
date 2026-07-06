'use client';

import React, { Suspense } from 'react';
import CourseViewerClient from './CourseViewerClient';

export default function CourseViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    }>
      <CourseViewerClient />
    </Suspense>
  );
}
