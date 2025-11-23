import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export function CourseDetails({ 
  title, 
  subtitle, 
  description,
  exerciseLink
}: { 
  title: string; 
  subtitle?: string | null;
  description: string;
  exerciseLink?: string | null;
}) {
  const isHtml = description.includes('<') && description.includes('>');

  return (
    <Card id="description" className="scroll-mt-32 bg-white/95 backdrop-blur-sm border-slate-200 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-balance">{title}</CardTitle>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="leading-relaxed text-muted-foreground space-y-4">
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
        
        {exerciseLink && (
          <div className="pt-4 border-t">
            <a 
              href={exerciseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <span>Bài tập</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
