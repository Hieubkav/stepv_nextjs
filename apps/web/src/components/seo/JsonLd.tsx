import type { JsonLdType } from '@/lib/seo/structured-data';

export interface JsonLdProps {
  data: JsonLdType | JsonLdType[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]),
      }}
    />
  );
}
