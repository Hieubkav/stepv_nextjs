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
  const isHtml = description.includes('<') && description.includes('>');

  return (
    <Card id="description">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-balance">{title}</CardTitle>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="leading-relaxed text-muted-foreground">
        {isHtml ? (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <div className="space-y-4">
            {description.split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
