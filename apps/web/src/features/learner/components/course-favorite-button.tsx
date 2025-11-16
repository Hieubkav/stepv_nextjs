'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { useCourseFavorite } from '../hooks/use-course-favorite';

type StudentId = Id<'students'>;
type CourseId = Id<'courses'>;

interface CourseFavoriteButtonProps {
    studentId: StudentId | null;
    courseId: CourseId;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showLabel?: boolean;
}

export function CourseFavoriteButton({
    studentId,
    courseId,
    size = 'md',
    className = '',
    showLabel = false,
}: CourseFavoriteButtonProps) {
    const { isFavorited, toggle, isLoading } = useCourseFavorite(studentId, courseId);
    const [isOptimistic, setIsOptimistic] = useState(false);

    const sizeMap = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsOptimistic(true);
        const result = await toggle(e);
        setIsOptimistic(false);
        if (!result.ok) {
            toast.error(result.error || 'Không thể cập nhật yêu thích');
            console.error('Failed to toggle favorite:', result.error);
        } else {
            toast.success(result.isFavorited ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
        }
    };

    const displayFavorited = isFavorited;

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 transition-colors ${className}`}
            aria-label={displayFavorited ? 'Remove from favorites' : 'Add to favorites'}
            title={displayFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
            <Heart
                className={`${sizeMap[size]} transition-all ${displayFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
            />
            {showLabel && (
                <span className="text-sm font-medium">
                    {displayFavorited ? 'Đã thích' : 'Thích'}
                </span>
            )}
        </button>
    );
}
