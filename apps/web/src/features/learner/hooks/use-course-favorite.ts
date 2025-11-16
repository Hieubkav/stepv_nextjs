'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

type StudentId = Id<'students'>;
type CourseId = Id<'courses'>;

export function useCourseFavorite(studentId: StudentId | null, courseId: CourseId) {
    const toggleMutation = useMutation(api.course_favorites.toggleCourseFavorite);

    const favoriteStatus = useQuery(
        api.course_favorites.isCourseFavorited,
        studentId && courseId
            ? { studentId, courseId }
            : 'skip'
    );

    const isFavorited = useMemo(
        () => favoriteStatus?.isFavorited ?? false,
        [favoriteStatus]
    );

    const toggle = useCallback(
        async (e?: React.MouseEvent) => {
            e?.preventDefault();
            e?.stopPropagation();

            if (!studentId) {
                return { ok: false, error: 'Vui lòng đăng nhập để sử dụng tính năng này' };
            }

            try {
                const result = await toggleMutation({ studentId, courseId });
                return result;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật yêu thích';
                console.error('Toggle favorite error:', error);
                return { ok: false, error: message };
            }
        },
        [studentId, courseId, toggleMutation]
    );

    return {
        isFavorited,
        toggle,
        isLoading: favoriteStatus === undefined && studentId !== null,
    };
}
