"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/.source";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users } from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<"all" | "free" | "paid">("all");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<
    "newest" | "popular" | "rating" | "price_asc" | "price_desc"
  >("newest");
  const [offset, setOffset] = useState(0);

  // Queries
  const categories = useQuery(api.categories.listCategories, {});
  const stats = useQuery(api.search.getCourseStatistics, {});
  const searchResults = useQuery(api.search.searchCourses, {
    q: searchQuery || undefined,
    categoryId: (selectedCategory as any) || undefined,
    pricingType: pricingType === "all" ? undefined : (pricingType as any),
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
    limit: 12,
    offset,
  });

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPricingType("all");
    setPriceRange([0, 5000000]);
    setMinRating(0);
    setSortBy("newest");
    setOffset(0);
  };

  if (!categories || !stats || !searchResults) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Khóa Học</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Khám phá {stats.totalCourses} khóa học chất lượng cao
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-6 sticky top-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Tìm Kiếm</label>
              <Input
                placeholder="Tìm khóa học..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOffset(0);
                }}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-2">Danh Mục</label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) => {
                  setSelectedCategory(value === "all" ? null : value);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Loại Khóa</label>
              <Select
                value={pricingType}
                onValueChange={(value: any) => {
                  setPricingType(value);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả</SelectItem>
                  <SelectItem value="free">Miễn Phí</SelectItem>
                  <SelectItem value="paid">Trả Phí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            {stats.priceRange.max > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Khoảng Giá
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VND
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={stats.priceRange.min}
                  max={stats.priceRange.max}
                  step={100000}
                />
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Đánh Giá Tối Thiểu</label>
              <Select
                value={minRating.toString()}
                onValueChange={(value) => {
                  setMinRating(parseInt(value));
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất Cả</SelectItem>
                  <SelectItem value="3">⭐ 3.0+</SelectItem>
                  <SelectItem value="4">⭐ 4.0+</SelectItem>
                  <SelectItem value="5">⭐ 5.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sắp Xếp</label>
              <Select
                value={sortBy}
                onValueChange={(value: any) => {
                  setSortBy(value);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới Nhất</SelectItem>
                  <SelectItem value="popular">Phổ Biến Nhất</SelectItem>
                  <SelectItem value="rating">Đánh Giá Cao</SelectItem>
                  <SelectItem value="price_asc">Giá Thấp → Cao</SelectItem>
                  <SelectItem value="price_desc">Giá Cao → Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleReset} className="w-full">
              Xóa Bộ Lọc
            </Button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="lg:col-span-3">
          {searchResults.items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Không tìm thấy khóa học nào phù hợp
              </p>
              <Button onClick={handleReset}>Xóa Bộ Lọc</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {searchResults.items.length} / {searchResults.totalCount} khóa học
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.items.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.hasMore && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setOffset(offset + 12)}
                    variant="outline"
                  >
                    Xem Thêm
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: any;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/khoa-hoc/${course.slug}`}>
      <Card className="hover:shadow-lg transition cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-40 flex items-center justify-center relative">
            {course.pricingType === "paid" && (
              <Badge className="absolute top-2 right-2">Trả Phí</Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div>
              <h3 className="font-semibold line-clamp-2">{course.title}</h3>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              {course.averageRating ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({course.totalReviews})
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Chưa có đánh giá</span>
              )}
              {course.enrollmentCount && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              {course.pricingType === "free" ? (
                <p className="font-bold text-green-600">Miễn Phí</p>
              ) : (
                <p className="font-bold text-lg">
                  {course.priceAmount?.toLocaleString()} VND
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
