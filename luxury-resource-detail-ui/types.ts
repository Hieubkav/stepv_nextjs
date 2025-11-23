export interface PreviewItem {
  id: string;
  type: 'image';
  url: string;
  thumbnail: string;
  label: string;
}

export interface RelatedResource {
  id: string;
  title: string;
  link: string;
  thumbnail: string; // Thêm trường thumbnail
  isLocked?: boolean;
}

export interface ResourceDetail {
  id: string;
  title: string;
  description: string;
  detailedContent: string;
  price: number;
  originalPrice?: number; // Giá gốc để so sánh
  currency: string;
  previews: PreviewItem[];
  related: RelatedResource[];
}