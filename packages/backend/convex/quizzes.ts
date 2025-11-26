// Hệ thống trắc nghiệm
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Get quiz details (không hiển thị đáp án)
 */
export const getQuizDetail = query({
  args: {
    quizId: v.id("course_quizzes"),
  },
  handler: async (ctx, { quizId }) => {
    const quiz = await ctx.db.get(quizId);
    if (!quiz || !quiz.active) {
      throw new ConvexError("Quiz không tồn tại");
    }

    // Get questions
    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
      .collect();

    const sortedQuestions = questions
      .filter((q: any) => q.active)
      .sort((a: any, b: any) => a.order - b.order)
      .map((q: any) => ({
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        // NOT sending correctAnswer
      }));

    return {
      quizId,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      allowRetake: quiz.allowRetake,
      passingScore: quiz.passingScore,
      totalQuestions: sortedQuestions.length,
      questions: sortedQuestions,
    };
  },
});

/**
 * Submit quiz answers - gửi bài trả lời
 */
export const submitQuizAnswers = mutation({
  args: {
    studentId: v.id("students"),
    quizId: v.id("course_quizzes"),
    courseId: v.id("courses"),
    answers: v.array(
      v.object({
        questionId: v.id("quiz_questions"),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, { studentId, quizId, courseId, answers }) => {
    const quiz = await ctx.db.get(quizId);
    if (!quiz) throw new ConvexError("Quiz not found");

    // Grade the quiz
    const { score, passedCount, totalCount } = await gradeQuizAnswers(
      ctx,
      quizId,
      answers
    );

    const passed = score >= quiz.passingScore;
    const now = Date.now();

    // Create attempt record
    const attemptId = await ctx.db.insert("quiz_attempts", {
      studentId,
      quizId,
      courseId,
      answers,
      score,
      passed,
      submittedAt: now,
      createdAt: now,
    });

    return {
      attemptId,
      score,
      passed,
      passingScore: quiz.passingScore,
      passedCount,
      totalCount,
      message: passed
        ? `Chúc mừng! Bạn đạt ${score} điểm`
        : `Bạn cần ${quiz.passingScore} điểm để đạt. Bạn được ${score} điểm`,
    };
  },
});

/**
 * Grade quiz answers - chấm điểm
 */
async function gradeQuizAnswers(
  ctx: any,
  quizId: Id<"course_quizzes">,
  answers: Array<{ questionId: Id<"quiz_questions">; answer: string }>
): Promise<{ score: number; passedCount: number; totalCount: number }> {
  // Get all questions
  const questions = await ctx.db
    .query("quiz_questions")
    .withIndex("by_quiz", (q: any) => q.eq("quizId", quizId))
    .collect();

  if (questions.length === 0) {
    return { score: 0, passedCount: 0, totalCount: 0 };
  }

  // Check each answer
  let passedCount = 0;
  for (const answer of answers) {
    const question = questions.find((q: any) => q._id === answer.questionId);
    if (!question) continue;

    // Simple string comparison (case-insensitive)
    if (
      question.correctAnswer.toLowerCase().trim() === answer.answer.toLowerCase().trim()
    ) {
      passedCount++;
    }
  }

  // Calculate score: (passed / total) * 100
  const score = Math.round((passedCount / questions.length) * 100);

  return {
    score,
    passedCount,
    totalCount: questions.length,
  };
}

/**
 * Get quiz result - xem kết quả (có đáp án)
 */
export const getQuizResult = query({
  args: {
    attemptId: v.id("quiz_attempts"),
  },
  handler: async (ctx, { attemptId }) => {
    const attempt = await ctx.db.get(attemptId);
    if (!attempt) throw new ConvexError("Attempt not found");

    // Get quiz info
    const quiz = await ctx.db.get(attempt.quizId);
    if (!quiz) throw new ConvexError("Quiz not found");

    // Get questions with correct answers
    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", attempt.quizId))
      .collect();

    // Build result with correct answers
    const questionsResult = questions
      .filter((q: any) => q.active)
      .map((q: any) => {
        const studentAnswer = attempt.answers.find(
          (a: any) => a.questionId === q._id
        );
        const isCorrect =
          studentAnswer &&
          q.correctAnswer.toLowerCase().trim() ===
            studentAnswer.answer.toLowerCase().trim();

        return {
          questionId: q._id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          studentAnswer: studentAnswer?.answer || "",
          isCorrect,
          explanation: q.explanation,
        };
      });

    return {
      attemptId,
      quizId: attempt.quizId,
      quizTitle: quiz.title,
      score: attempt.score,
      passed: attempt.passed,
      passingScore: quiz.passingScore,
      submittedAt: attempt.submittedAt,
      questions: questionsResult,
      summary: {
        totalQuestions: questionsResult.length,
        correctAnswers: questionsResult.filter((q) => q.isCorrect).length,
        message: attempt.passed
          ? `Bạn đã đạt! Điểm: ${attempt.score}`
          : `Bạn chưa đạt. Điểm: ${attempt.score}/${quiz.passingScore}`,
      },
    };
  },
});

/**
 * Get student's quiz attempts
 */
export const getStudentQuizAttempts = query({
  args: {
    studentId: v.id("students"),
    quizId: v.id("course_quizzes"),
  },
  handler: async (ctx, { studentId, quizId }) => {
    const attempts = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_student_quiz", (q) =>
        q.eq("studentId", studentId).eq("quizId", quizId)
      )
      .collect();

    return attempts
      .sort((a: any, b: any) => b.submittedAt - a.submittedAt)
      .map((a: any) => ({
        attemptId: a._id,
        score: a.score,
        passed: a.passed,
        submittedAt: a.submittedAt,
      }));
  },
});

/**
 * Get quiz statistics - thống kê quiz
 */
export const getQuizStatistics = query({
  args: {
    quizId: v.id("course_quizzes"),
  },
  handler: async (ctx, { quizId }) => {
    const attempts = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
      .collect();

    if (attempts.length === 0) {
      return {
        quizId,
        totalAttempts: 0,
        passedAttempts: 0,
        passRate: 0,
        averageScore: 0,
      };
    }

    const passedAttempts = attempts.filter((a: any) => a.passed).length;
    const passRate = Math.round((passedAttempts / attempts.length) * 100);
    const averageScore = Math.round(
      attempts.reduce((sum: number, a: any) => sum + a.score, 0) / attempts.length
    );

    return {
      quizId,
      totalAttempts: attempts.length,
      passedAttempts,
      failedAttempts: attempts.length - passedAttempts,
      passRate,
      averageScore,
      highestScore: Math.max(...attempts.map((a: any) => a.score)),
      lowestScore: Math.min(...attempts.map((a: any) => a.score)),
    };
  },
});

/**
 * Check if student can retake quiz
 */
export const canRetakeQuiz = query({
  args: {
    studentId: v.id("students"),
    quizId: v.id("course_quizzes"),
  },
  handler: async (ctx, { studentId, quizId }) => {
    const quiz = await ctx.db.get(quizId);
    if (!quiz) throw new ConvexError("Quiz not found");

    if (!quiz.allowRetake) {
      return { canRetake: false, message: "Quiz này không được phép làm lại" };
    }

    const lastAttempt = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_student_quiz", (q) =>
        q.eq("studentId", studentId).eq("quizId", quizId)
      )
      .order("desc")
      .first();

    if (!lastAttempt) {
      return { canRetake: true, message: "Bạn chưa làm bài này" };
    }

    if (lastAttempt.passed) {
      return {
        canRetake: quiz.allowRetake,
        message: "Bạn đã đạt rồi. Bạn vẫn có thể làm lại để cải thiện điểm",
      };
    }

    return {
      canRetake: true,
      message: "Bạn có thể làm lại để cải thiện điểm",
    };
  },
});
