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
    <Card
      id="description"
      className="scroll-mt-32 border border-slate-800/70 bg-[#050914] text-slate-200 shadow-[0_22px_60px_rgba(0,0,0,0.55)]"
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-balance text-white">{title}</CardTitle>
        {subtitle ? <p className="text-slate-400">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4 leading-relaxed text-slate-300">
        {isHtml ? (
          <div 
            className="prose prose-sm max-w-none prose-invert prose-p:text-slate-300 prose-headings:text-white"
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
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-yellow-300 px-4 py-2 font-medium text-black transition-all hover:shadow-[0_12px_32px_rgba(255,193,7,0.25)]"
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
