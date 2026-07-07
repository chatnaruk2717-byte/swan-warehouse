import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Retrieve list of all courses
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const coursesResult = await query('SELECT * FROM courses ORDER BY category, name ASC');
    return res.json(coursesResult.rows);

  } catch (err: any) {
    return res.json(mockStore.mockCourses);
  }
});

/**
 * @swagger
 * /api/courses/:id:
 *   get:
 *     summary: Retrieve course structure, chapters, and lessons
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  const isAdminOrStaff = req.user && ['admin', 'staff'].includes(req.user.role);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const courseResult = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    const course = courseResult.rows[0];

    const chaptersResult = await query('SELECT * FROM chapters WHERE course_id = $1 ORDER BY sort_order ASC', [courseId]);
    const chapters = chaptersResult.rows;

    for (const chapter of chapters) {
      const lessonsResult = await query('SELECT * FROM lessons WHERE chapter_id = $1 ORDER BY sort_order ASC', [chapter.id]);
      const lessons = lessonsResult.rows;

      // For quiz lessons, attach questions (excluding correct answers for regular employees)
      for (const lesson of lessons) {
        if (lesson.content_type === 'quiz') {
          const selectFields = isAdminOrStaff
            ? 'id, question_type, question_text, media_url, options, correct_answers, points'
            : 'id, question_type, question_text, media_url, options, points';
          const questionsResult = await query(`SELECT ${selectFields} FROM questions WHERE lesson_id = $1`, [lesson.id]);
          lesson.questions = questionsResult.rows;
        }
      }
      chapter.lessons = lessons;
    }

    course.chapters = chapters;
    return res.json(course);

  } catch (err: any) {
    console.error(`Error in GET /api/courses/${courseId}:`, err);
    // Mock Mode Fallback
    const course = mockStore.mockCourses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found (Mock).' });
    }

    const chapters = mockStore.mockChapters
      .filter(ch => ch.course_id === courseId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(ch => {
        const lessons = mockStore.mockLessons
          .filter(l => l.chapter_id === ch.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(l => {
            const copy = { ...l } as any;
            if (l.content_type === 'quiz') {
              copy.questions = mockStore.mockQuestions
                .filter(q => q.lesson_id === l.id)
                .map(q => {
                  const qCopy = {
                    id: q.id,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    media_url: q.media_url,
                    options: q.options,
                    points: q.points
                  } as any;
                  if (isAdminOrStaff) {
                    qCopy.correct_answers = q.correct_answers;
                  }
                  return qCopy;
                });
            }
            return copy;
          });
        return {
          ...ch,
          lessons
        };
      });

    return res.json({
      ...course,
      chapters
    });
  }
});

/**
 * @swagger
 * /api/courses/enrollments/employee/:id:
 *   get:
 *     summary: Retrieve enrollments for a specific employee
 */
router.get('/enrollments/employee/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const empId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const enrollQuery = `
      SELECT 
        e.id,
        e.course_id,
        c.name as course_name,
        c.category as course_category,
        c.duration_minutes,
        e.progress_percentage,
        e.status,
        e.due_date,
        e.completed_at,
        e.certificate_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.employee_id = $1
    `;
    const result = await query(enrollQuery, [empId]);
    return res.json(result.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    const list = mockStore.mockEnrollments
      .filter(e => e.employee_id === empId)
      .map(e => {
        const course = mockStore.mockCourses.find(c => c.id === e.course_id);
        return {
          id: e.id,
          course_id: e.course_id,
          course_name: course ? course.name : 'Unknown',
          course_category: course ? course.category : '',
          duration_minutes: course ? course.duration_minutes : 0,
          progress_percentage: e.progress_percentage,
          status: e.status,
          due_date: e.due_date,
          completed_at: e.completed_at,
          certificate_id: e.certificate_id
        };
      });
    return res.json(list);
  }
});

/**
 * @swagger
 * /api/courses/enrollments/course/:id:
 *   get:
 *     summary: Retrieve enrollments/learners for a specific course
 */
router.get('/enrollments/course/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const enrollQuery = `
      SELECT 
        e.id,
        e.employee_id,
        u.name as employee_name,
        u.employee_id as emp_code,
        u.department,
        u.position,
        e.progress_percentage,
        e.status,
        e.completed_at,
        e.due_date
      FROM enrollments e
      JOIN users u ON e.employee_id = u.id
      WHERE e.course_id = $1 AND (u.role = 'employee' OR u.role = 'staff') AND u.department != 'Management'
      ORDER BY e.progress_percentage DESC, u.name ASC
    `;
    const result = await query(enrollQuery, [courseId]);
    return res.json(result.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    const list = mockStore.mockEnrollments
      .filter(e => e.course_id === courseId)
      .map(e => {
        const emp = mockStore.mockUsers.find(u => u.id === e.employee_id);
        return {
          id: e.id,
          employee_id: e.employee_id,
          employee_name: emp ? emp.name : 'Unknown',
          emp_code: emp ? emp.employee_id : 'N/A',
          department: emp ? emp.department : 'N/A',
          position: emp ? emp.position : 'N/A',
          progress_percentage: e.progress_percentage,
          status: e.status,
          completed_at: e.completed_at || null,
          due_date: e.due_date || null
        };
      });
    return res.json(list);
  }
});

/**
 * @swagger
 * /api/courses/enroll:
 *   post:
 *     summary: Assign a course to an employee
 */
router.post('/enroll', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, course_id, due_date } = req.body;
  const assignedBy = req.user?.id;

  if (!employee_id || !course_id) {
    return res.status(400).json({ message: 'employee_id and course_id are required.' });
  }

  const empId = parseInt(employee_id, 10);
  const courseId = parseInt(course_id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    await query(
      `INSERT INTO enrollments (employee_id, course_id, progress_percentage, status, assigned_by, due_date) 
       VALUES ($1, $2, 0, 'pending', $3, $4) 
       ON DUPLICATE KEY UPDATE due_date = VALUES(due_date)`,
      [empId, courseId, assignedBy || null, due_date || null]
    );
    const selectRes = await query('SELECT * FROM enrollments WHERE employee_id = $1 AND course_id = $2', [empId, courseId]);
    return res.status(201).json(selectRes.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const existing = mockStore.mockEnrollments.find(e => e.employee_id === empId && e.course_id === courseId);
    if (existing) {
      existing.due_date = due_date || existing.due_date;
      return res.json(existing);
    }

    const newId = mockStore.mockEnrollments.reduce((max, e) => e.id > max ? e.id : max, 0) + 1;
    const newEnrollment = {
      id: newId,
      employee_id: empId,
      course_id: courseId,
      progress_percentage: 0,
      status: 'pending' as const,
      assigned_by: assignedBy || null,
      assigned_at: new Date().toISOString(),
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 30 days
    };

    mockStore.mockEnrollments.push(newEnrollment);
    return res.status(201).json(newEnrollment);
  }
});

/**
 * @swagger
 * /api/courses/lesson/:id/progress:
 *   post:
 *     summary: Mark a lesson as completed
 */
router.post('/lesson/:id/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = parseInt(req.params.id, 10);
  const employeeId = req.user?.id;
  const { completed } = req.body; // boolean

  if (completed === undefined) {
    return res.status(400).json({ message: 'completed status (boolean) is required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Insert or update lesson progress
    if (completed) {
      await query(
        `INSERT IGNORE INTO lesson_progress (employee_id, lesson_id, completed) 
         VALUES ($1, $2, TRUE)`,
        [employeeId, lessonId]
      );
    } else {
      await query(
        `DELETE FROM lesson_progress WHERE employee_id = $1 AND lesson_id = $2`,
        [employeeId, lessonId]
      );
    }

    // Recalculate progress for this course
    // 1. Get the course ID from the lesson
    const courseRes = await query(
      `SELECT c.id FROM courses c 
       JOIN chapters ch ON ch.course_id = c.id 
       JOIN lessons l ON l.chapter_id = ch.id 
       WHERE l.id = $1`,
      [lessonId]
    );

    if (courseRes.rows.length > 0) {
      const courseId = courseRes.rows[0].id;
      
      // Count total lessons
      const totalLessonsRes = await query(
        `SELECT COUNT(l.id) as count FROM lessons l 
         JOIN chapters ch ON l.chapter_id = ch.id 
         WHERE ch.course_id = $1`,
        [courseId]
      );
      const totalLessons = parseInt(totalLessonsRes.rows[0].count, 10);

      // Count completed lessons
      const completedLessonsRes = await query(
        `SELECT COUNT(lp.id) as count FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         JOIN chapters ch ON l.chapter_id = ch.id
         WHERE lp.employee_id = $1 AND ch.course_id = $2 AND lp.completed = TRUE`,
        [employeeId, courseId]
      );
      const completedLessons = parseInt(completedLessonsRes.rows[0].count, 10);

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const status = progress === 100 ? 'completed' : 'in_progress';
      const certId = progress === 100 ? `CERT-${courseId}-${employeeId}-${Date.now().toString().slice(-4)}` : null;

      await query(
        `UPDATE enrollments 
         SET progress_percentage = $1, status = $2, completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE NULL END, certificate_id = CASE WHEN $2 = 'completed' THEN COALESCE(certificate_id, $3) ELSE NULL END 
         WHERE employee_id = $4 AND course_id = $5`,
        [progress, status, certId, employeeId, courseId]
      );
    }

    return res.json({ message: 'Progress updated.' });

  } catch (err: any) {
    // Mock Mode Fallback
    // Find lesson and chapter
    const lesson = mockStore.mockLessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found (Mock).' });
    }
    const chapter = mockStore.mockChapters.find(ch => ch.id === lesson.chapter_id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found (Mock).' });
    }
    const courseId = chapter.course_id;

    // Update progress log
    const progressIndex = mockStore.mockLessonProgress.findIndex(lp => lp.employee_id === employeeId && lp.lesson_id === lessonId);
    if (completed) {
      if (progressIndex === -1) {
        mockStore.mockLessonProgress.push({
          id: mockStore.mockLessonProgress.length + 1,
          employee_id: employeeId!,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      }
    } else {
      if (progressIndex !== -1) {
        mockStore.mockLessonProgress.splice(progressIndex, 1);
      }
    }

    // Recalculate
    const allCourseLessons = mockStore.mockLessons.filter(l => {
      const ch = mockStore.mockChapters.find(c => c.id === l.chapter_id);
      return ch && ch.course_id === courseId;
    });

    const completedCourseLessons = mockStore.mockLessonProgress.filter(lp => {
      if (lp.employee_id !== employeeId || !lp.completed) return false;
      const l = mockStore.mockLessons.find(les => les.id === lp.lesson_id);
      const ch = l ? mockStore.mockChapters.find(c => c.id === l.chapter_id) : null;
      return ch && ch.course_id === courseId;
    });

    const total = allCourseLessons.length;
    const done = completedCourseLessons.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const enrollment = mockStore.mockEnrollments.find(e => e.employee_id === employeeId && e.course_id === courseId);
    if (enrollment) {
      enrollment.progress_percentage = percent;
      enrollment.status = percent === 100 ? 'completed' : 'in_progress';
      if (percent === 100) {
        enrollment.completed_at = new Date().toISOString();
        enrollment.certificate_id = enrollment.certificate_id || `CERT-${courseId}-${employeeId}-${Math.floor(Math.random() * 9000 + 1000)}`;
      } else {
        enrollment.completed_at = undefined;
        enrollment.certificate_id = undefined;
      }
    }

    return res.json({ message: 'Progress updated (Mock).', progress: percent });
  }
});

/**
 * @swagger
 * /api/courses/lesson/:id/quiz-submit:
 *   post:
 *     summary: Submit a quiz and evaluate score
 */
router.post('/lesson/:id/quiz-submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = parseInt(req.params.id, 10);
  const employeeId = req.user?.id;
  const { answers, questionIds } = req.body; // Expecting answers: { questionId: [selectedIndices] }, questionIds: [1, 2, 3...]

  if (!answers) {
    return res.status(400).json({ message: 'Quiz answers are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Retrieve full questions and their correct answers from database
    const questionsResult = await query(
      'SELECT id, correct_answers, points FROM questions WHERE lesson_id = $1',
      [lessonId]
    );
    const questions = questionsResult.rows;

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this quiz.' });
    }

    // Filter questions list if questionIds is provided from frontend (random subset)
    const filteredQuestions = questionIds && Array.isArray(questionIds)
      ? questions.filter(q => questionIds.includes(q.id))
      : questions;

    if (filteredQuestions.length === 0) {
      return res.status(400).json({ message: 'Submitted question subset does not match database.' });
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of filteredQuestions) {
      totalPoints += q.points;
      const submitted = answers[q.id];

      if (submitted && Array.isArray(submitted)) {
        // Compare arrays
        const correct = q.correct_answers; // array of indices
        const isCorrect = correct.length === submitted.length && 
                          correct.every((val: number) => submitted.includes(val));
        if (isCorrect) {
          earnedPoints += q.points;
        }
      }
    }

    const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = pct >= 80; // 80% passing grade

    // Log the quiz attempt
    await query(
      'INSERT INTO quiz_attempts (employee_id, lesson_id, score, passed) VALUES ($1, $2, $3, $4)',
      [employeeId, lessonId, pct, passed]
    );

    // If passed, mark this lesson as completed!
    if (passed) {
      await query(
        `INSERT IGNORE INTO lesson_progress (employee_id, lesson_id, completed) 
         VALUES ($1, $2, TRUE)`,
        [employeeId, lessonId]
      );

      // Recalculate enrollment progress
      const courseRes = await query(
        `SELECT c.id FROM courses c 
         JOIN chapters ch ON ch.course_id = c.id 
         JOIN lessons l ON l.chapter_id = ch.id 
         WHERE l.id = $1`,
        [lessonId]
      );

      if (courseRes.rows.length > 0) {
        const courseId = courseRes.rows[0].id;
        
        // Count total lessons
        const totalLessonsRes = await query(
          `SELECT COUNT(l.id) as count FROM lessons l 
           JOIN chapters ch ON l.chapter_id = ch.id 
           WHERE ch.course_id = $1`,
          [courseId]
        );
        const totalLessons = parseInt(totalLessonsRes.rows[0].count, 10);

        // Count completed lessons
        const completedLessonsRes = await query(
          `SELECT COUNT(lp.id) as count FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.id
           JOIN chapters ch ON l.chapter_id = ch.id
           WHERE lp.employee_id = $1 AND ch.course_id = $2 AND lp.completed = TRUE`,
          [employeeId, courseId]
        );
        const completedLessons = parseInt(completedLessonsRes.rows[0].count, 10);

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const status = progress === 100 ? 'completed' : 'in_progress';
        const certId = progress === 100 ? `CERT-${courseId}-${employeeId}-${Date.now().toString().slice(-4)}` : null;

        await query(
          `UPDATE enrollments 
           SET progress_percentage = $1, status = $2, completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE NULL END, certificate_id = CASE WHEN $2 = 'completed' THEN COALESCE(certificate_id, $3) ELSE NULL END 
           WHERE employee_id = $4 AND course_id = $5`,
          [progress, status, certId, employeeId, courseId]
        );
      }
    }

    return res.json({
      score: pct,
      passed,
      earnedPoints,
      totalPoints
    });

  } catch (err: any) {
    // Mock Mode Fallback
    const quizQuestions = mockStore.mockQuestions.filter(q => q.lesson_id === lessonId);
    if (quizQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this quiz (Mock).' });
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of quizQuestions) {
      totalPoints += q.points;
      const submitted = answers[q.id];

      if (submitted && Array.isArray(submitted)) {
        const correct = q.correct_answers;
        const isCorrect = correct.length === submitted.length && 
                          correct.every(val => submitted.includes(val));
        if (isCorrect) {
          earnedPoints += q.points;
        }
      }
    }

    const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = pct >= 80;

    mockStore.mockQuizAttempts.push({
      id: mockStore.mockQuizAttempts.length + 1,
      employee_id: employeeId!,
      lesson_id: lessonId,
      score: pct,
      passed,
      completed_at: new Date().toISOString()
    });

    if (passed) {
      const progressIndex = mockStore.mockLessonProgress.findIndex(lp => lp.employee_id === employeeId && lp.lesson_id === lessonId);
      if (progressIndex === -1) {
        mockStore.mockLessonProgress.push({
          id: mockStore.mockLessonProgress.length + 1,
          employee_id: employeeId!,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      }

      // Recalculate Course Progress
      const lesson = mockStore.mockLessons.find(l => l.id === lessonId);
      const chapter = lesson ? mockStore.mockChapters.find(ch => ch.id === lesson.chapter_id) : null;
      if (chapter) {
        const courseId = chapter.course_id;

        const allCourseLessons = mockStore.mockLessons.filter(l => {
          const ch = mockStore.mockChapters.find(c => c.id === l.chapter_id);
          return ch && ch.course_id === courseId;
        });

        const completedCourseLessons = mockStore.mockLessonProgress.filter(lp => {
          if (lp.employee_id !== employeeId || !lp.completed) return false;
          const l = mockStore.mockLessons.find(les => les.id === lp.lesson_id);
          const ch = l ? mockStore.mockChapters.find(c => c.id === l.chapter_id) : null;
          return ch && ch.course_id === courseId;
        });

        const percent = Math.round((completedCourseLessons.length / allCourseLessons.length) * 100);
        const enrollment = mockStore.mockEnrollments.find(e => e.employee_id === employeeId && e.course_id === courseId);
        if (enrollment) {
          enrollment.progress_percentage = percent;
          enrollment.status = percent === 100 ? 'completed' : 'in_progress';
          if (percent === 100) {
            enrollment.completed_at = new Date().toISOString();
            enrollment.certificate_id = enrollment.certificate_id || `CERT-${courseId}-${employeeId}-${Math.floor(Math.random() * 9000 + 1000)}`;
          }
        }
      }
    }

    return res.json({
      score: pct,
      passed,
      earnedPoints,
      totalPoints
    });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new training course
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, duration_minutes, category, instructor, difficulty, estimated_time } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'Course name and category are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO courses (name, description, duration_minutes, category, instructor, difficulty, estimated_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description || '', parseInt(duration_minutes, 10) || 0, category, instructor || '', difficulty || 'beginner', estimated_time || '']
    );
    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const duplicate = mockStore.mockCourses.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ message: 'Course name already exists.' });
    }

    const newId = mockStore.mockCourses.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
    const newCourse = {
      id: newId,
      name,
      description: description || '',
      duration_minutes: parseInt(duration_minutes, 10) || 0,
      category,
      instructor: instructor || '',
      difficulty: (difficulty || 'beginner') as any,
      estimated_time: estimated_time || '',
      certificate_enabled: true
    };

    mockStore.mockCourses.push(newCourse);
    return res.status(201).json(newCourse);
  }
});

/**
 * PUT /api/courses/:id
 * Update course details (supports cover_image)
 */
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  const { name, description, duration_minutes, category, instructor, difficulty, estimated_time, cover_image } = req.body;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const updateQuery = `
      UPDATE courses 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        duration_minutes = COALESCE($3, duration_minutes),
        category = COALESCE($4, category),
        instructor = COALESCE($5, instructor),
        difficulty = COALESCE($6, difficulty),
        estimated_time = COALESCE($7, estimated_time),
        cover_image = COALESCE($8, cover_image),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const result = await query(updateQuery, [
      name, description, duration_minutes ? parseInt(duration_minutes, 10) : null,
      category, instructor, difficulty, estimated_time, cover_image, courseId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    const course = mockStore.mockCourses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found (Mock).' });
    }

    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (duration_minutes !== undefined) course.duration_minutes = parseInt(duration_minutes, 10);
    if (category !== undefined) course.category = category;
    if (instructor !== undefined) course.instructor = instructor;
    if (difficulty !== undefined) course.difficulty = difficulty;
    if (estimated_time !== undefined) course.estimated_time = estimated_time;
    if (cover_image !== undefined) course.cover_image = cover_image;

    return res.json(course);
  }
});

/**
 * POST /api/courses/:id/chapters
 * Create a new chapter under a course
 */
router.post('/:id/chapters', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  const { title, sort_order } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Chapter title is required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO chapters (course_id, title, sort_order) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [courseId, title, parseInt(sort_order, 10) || 0]
    );
    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    const newId = mockStore.mockChapters.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
    const newChapter = {
      id: newId,
      course_id: courseId,
      title,
      sort_order: parseInt(sort_order, 10) || 0
    };
    mockStore.mockChapters.push(newChapter);
    return res.status(201).json(newChapter);
  }
});

/**
 * POST /api/courses/chapters/:id/lessons
 * Create a new lesson under a chapter
 */
router.post('/chapters/:id/lessons', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const chapterId = parseInt(req.params.id, 10);
  const { title, content_type, content_url, body_text, sort_order } = req.body;

  if (!title || !content_type) {
    return res.status(400).json({ message: 'Lesson title and content_type are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO lessons (chapter_id, title, content_type, content_url, body_text, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [chapterId, title, content_type, content_url || null, body_text || null, parseInt(sort_order, 10) || 0]
    );
    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    const newId = mockStore.mockLessons.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
    const newLesson = {
      id: newId,
      chapter_id: chapterId,
      title,
      content_type: content_type as any,
      content_url,
      body_text,
      sort_order: parseInt(sort_order, 10) || 0
    };
    mockStore.mockLessons.push(newLesson);
    return res.status(201).json(newLesson);
  }
});

/**
 * POST /api/courses/lessons/:id/questions
 * Create a new quiz question under a lesson
 */
router.post('/lessons/:id/questions', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = parseInt(req.params.id, 10);
  const { question_text, question_type, options, correct_answers, points } = req.body;

  if (!question_text || !options || !correct_answers) {
    return res.status(400).json({ message: 'question_text, options, and correct_answers are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO questions (lesson_id, question_text, question_type, options, correct_answers, points) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [lessonId, question_text, question_type || 'multiple_choice', JSON.stringify(options), JSON.stringify(correct_answers), parseInt(points, 10) || 1]
    );
    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    const newId = mockStore.mockQuestions.reduce((max, q) => q.id > max ? q.id : max, 0) + 1;
    const newQuestion = {
      id: newId,
      lesson_id: lessonId,
      question_type: (question_type || 'multiple_choice') as any,
      question_text,
      options,
      correct_answers,
      points: parseInt(points, 10) || 1
    };
    mockStore.mockQuestions.push(newQuestion);
    return res.status(201).json(newQuestion);
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course and all its associated chapters, lessons, questions, and enrollments
 */
router.delete('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Cascade delete in PostgreSQL
    await query(`
      DELETE FROM questions WHERE lesson_id IN (
        SELECT l.id FROM lessons l
        JOIN chapters c ON l.chapter_id = c.id
        WHERE c.course_id = $1
      )
    `, [courseId]);

    await query(`
      DELETE FROM lesson_progress WHERE lesson_id IN (
        SELECT l.id FROM lessons l
        JOIN chapters c ON l.chapter_id = c.id
        WHERE c.course_id = $1
      )
    `, [courseId]);

    await query(`
      DELETE FROM lessons WHERE chapter_id IN (
        SELECT id FROM chapters WHERE course_id = $1
      )
    `, [courseId]);

    await query('DELETE FROM chapters WHERE course_id = $1', [courseId]);
    await query('DELETE FROM enrollments WHERE course_id = $1', [courseId]);
    const deleteResult = await query('DELETE FROM courses WHERE id = $1 RETURNING *', [courseId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    return res.json({ message: 'Course deleted successfully.' });

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockCourses.findIndex(c => c.id === courseId);
    if (index === -1) {
      return res.status(404).json({ message: 'Course not found (Mock).' });
    }

    const chapIds = mockStore.mockChapters.filter(ch => ch.course_id === courseId).map(ch => ch.id);
    const lesIds = mockStore.mockLessons.filter(l => chapIds.includes(l.chapter_id)).map(l => l.id);

    const filteredQuestions = mockStore.mockQuestions.filter(q => !lesIds.includes(q.lesson_id));
    mockStore.mockQuestions.length = 0;
    mockStore.mockQuestions.push(...filteredQuestions);

    const filteredLessons = mockStore.mockLessons.filter(l => !chapIds.includes(l.chapter_id));
    mockStore.mockLessons.length = 0;
    mockStore.mockLessons.push(...filteredLessons);

    const filteredChapters = mockStore.mockChapters.filter(ch => ch.course_id !== courseId);
    mockStore.mockChapters.length = 0;
    mockStore.mockChapters.push(...filteredChapters);

    const filteredEnrollments = mockStore.mockEnrollments.filter(e => e.course_id !== courseId);
    mockStore.mockEnrollments.length = 0;
    mockStore.mockEnrollments.push(...filteredEnrollments);

    mockStore.mockCourses.splice(index, 1);
    return res.json({ message: 'Course deleted successfully (Mock).' });
  }
});

/**
 * DELETE /api/courses/chapters/:id
 * Delete a chapter and all its lessons and questions
 */
router.delete('/chapters/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const chapterId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    await query(`
      DELETE FROM questions WHERE lesson_id IN (
        SELECT id FROM lessons WHERE chapter_id = $1
      )
    `, [chapterId]);

    await query(`
      DELETE FROM lesson_progress WHERE lesson_id IN (
        SELECT id FROM lessons WHERE chapter_id = $1
      )
    `, [chapterId]);

    await query('DELETE FROM lessons WHERE chapter_id = $1', [chapterId]);
    const deleteResult = await query('DELETE FROM chapters WHERE id = $1 RETURNING *', [chapterId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Chapter not found.' });
    }
    return res.json({ message: 'Chapter deleted successfully.' });

  } catch (err: any) {
    const index = mockStore.mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return res.status(404).json({ message: 'Chapter not found (Mock).' });
    }

    const lesIds = mockStore.mockLessons.filter(l => l.chapter_id === chapterId).map(l => l.id);

    const filteredQuestions = mockStore.mockQuestions.filter(q => !lesIds.includes(q.lesson_id));
    mockStore.mockQuestions.length = 0;
    mockStore.mockQuestions.push(...filteredQuestions);

    const filteredLessons = mockStore.mockLessons.filter(l => l.chapter_id !== chapterId);
    mockStore.mockLessons.length = 0;
    mockStore.mockLessons.push(...filteredLessons);

    mockStore.mockChapters.splice(index, 1);
    return res.json({ message: 'Chapter deleted successfully (Mock).' });
  }
});

/**
 * PUT /api/courses/chapters/:id
 * Edit chapter title
 */
router.put('/chapters/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const chapterId = parseInt(req.params.id, 10);
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Chapter title is required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const updateQuery = `
      UPDATE chapters 
      SET title = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await query(updateQuery, [title, chapterId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chapter not found.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    const chapter = mockStore.mockChapters.find(ch => ch.id === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found (Mock).' });
    }

    chapter.title = title;
    return res.json(chapter);
  }
});

/**
 * DELETE /api/courses/lessons/:id
 * Delete a lesson and its questions
 */
router.delete('/lessons/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    await query('DELETE FROM questions WHERE lesson_id = $1', [lessonId]);
    await query('DELETE FROM lesson_progress WHERE lesson_id = $1', [lessonId]);
    const deleteResult = await query('DELETE FROM lessons WHERE id = $1 RETURNING *', [lessonId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    return res.json({ message: 'Lesson deleted successfully.' });

  } catch (err: any) {
    const index = mockStore.mockLessons.findIndex(l => l.id === lessonId);
    if (index === -1) {
      return res.status(404).json({ message: 'Lesson not found (Mock).' });
    }

    const filteredQuestions = mockStore.mockQuestions.filter(q => q.lesson_id !== lessonId);
    mockStore.mockQuestions.length = 0;
    mockStore.mockQuestions.push(...filteredQuestions);

    mockStore.mockLessons.splice(index, 1);
    return res.json({ message: 'Lesson deleted successfully (Mock).' });
  }
});

/**
 * PUT /api/courses/lessons/:id
 * Edit lesson details
 */
router.put('/lessons/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = parseInt(req.params.id, 10);
  const { title, content_type, content_url, body_text } = req.body;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const updateQuery = `
      UPDATE lessons 
      SET 
        title = COALESCE($1, title),
        content_type = COALESCE($2, content_type),
        content_url = COALESCE($3, content_url),
        body_text = COALESCE($4, body_text),
        updated_at = NOW() 
      WHERE id = $5 
      RETURNING *
    `;
    const result = await query(updateQuery, [title, content_type, content_url || null, body_text || null, lessonId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    const lesson = mockStore.mockLessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found (Mock).' });
    }

    if (title !== undefined) lesson.title = title;
    if (content_type !== undefined) lesson.content_type = content_type as any;
    if (content_url !== undefined) lesson.content_url = content_url;
    if (body_text !== undefined) lesson.body_text = body_text;

    return res.json(lesson);
  }
});

export default router;
