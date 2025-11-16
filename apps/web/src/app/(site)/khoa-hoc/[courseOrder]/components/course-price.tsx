import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CoursePrice({ 
  priceText, 
  comparePriceText, 
  priceNote,
  pricingType
}: { 
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
}) {
  return (
    <Card id="support">
      <CardHeader>
        <CardTitle>Học phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{priceText}</span>
            {comparePriceText ? <span className="text-muted-foreground line-through">{comparePriceText}</span> : null}
          </div>
          {priceNote && pricingType === "paid" ? (
            <p className="text-xs text-muted-foreground mt-1">{priceNote}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
