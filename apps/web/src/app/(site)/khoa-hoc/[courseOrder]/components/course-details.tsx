import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseDetails({ 
  title, 
  subtitle, 
  description 
}: { 
  title: string; 
  subtitle?: string | null;
  description: string;
}) {
  const paragraphs = description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Card id="description">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-balance">{title}</CardTitle>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)
        ) : (
          <p>Nội dung khóa học đang được cập nhật.</p>
        )}
      </CardContent>
    </Card>
  );
}
