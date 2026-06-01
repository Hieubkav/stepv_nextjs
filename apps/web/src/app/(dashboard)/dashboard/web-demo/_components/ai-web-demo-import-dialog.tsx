"use client";

import React, { useState, useMemo } from "react";
import { Bot, Clipboard, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { WebDemoFormValues } from "./web-demo-form";

type AiWebDemoImportDialogProps = {
  onApply: (values: Partial<WebDemoFormValues>) => void;
};

const PROMPT_TEMPLATE = `Bạn là một chuyên gia viết nội dung chuyển đổi (Conversion Copywriter) cho các mẫu giao diện website cao cấp bán cho doanh nghiệp.
Nhiệm vụ của bạn là viết thông tin chi tiết của mẫu giao diện dựa trên tên thương hiệu/lĩnh vực hoạt động do người dùng cung cấp.

Hãy tập trung tối đa vào những điểm người mua theme thực sự quan tâm:
1. Giao diện sang trọng, bố cục chuẩn UI/UX thúc đẩy chuyển đổi (giữ khách hàng ở lại).
2. Tốc độ tải trang tối ưu vượt trội, chuẩn SEO Google 100% giúp dễ lên top.
3. Các tính năng thực chiến: Form đăng ký/đặt lịch thông minh, bản đồ chỉ đường, nút gọi nhanh, tích hợp MXH.
4. Trọng tâm, cực kỳ gọn gàng, ngắn gọn dưới 120 từ. Tránh viết dài dòng lê thê, dùng các đoạn ngắn gọn để người dùng dễ scan thông tin.

Yêu cầu xuất ra định dạng JSON chính xác theo cấu trúc dưới đây. Tuyệt đối không trả về bất kỳ văn bản giải thích nào khác ngoài chuỗi JSON sạch.

Cấu trúc JSON mong muốn:
{
  "title": "Tiêu đề mẫu giao diện website (Ví dụ: Spa An Nhiên - Mẫu Website Spa & Trị Liệu Cao Cấp)",
  "description": "Mô tả chi tiết và gọn gàng, chia thành 2-3 đoạn ngắn nhấn mạnh tính thẩm mỹ, tốc độ load, chuẩn SEO và các tính năng thực tế giúp chuyển đổi (Viết dưới dạng HTML cơ bản như <p> hoặc <br> để tương thích rich text, tối đa 120 từ)",
  "previewUrl": "URL xem thử demo (Ví dụ: https://demo.dohy.vn/spa-an-nhien)",
  "tags": "Các tag phân tách bằng dấu phẩy (Ví dụ: Spa & Làm đẹp, Trị liệu, Cao cấp)",
  "stats": [
    { "label": "Sections", "value": 12 },
    { "label": "Trang mẫu", "value": 8 },
    { "label": "Popup", "value": 2 },
    { "label": "Biểu mẫu", "value": 3 }
  ],
  "features": "Đặc điểm nổi bật (phân tách bởi dấu phẩy, tập trung vào kỹ thuật & chuyển đổi, Ví dụ: Giao diện chuẩn UI/UX, Tốc độ load tối ưu, Tương thích 100% Mobile, Chuẩn SEO 100% Google, Form đặt lịch thông minh)"
}

Thông tin yêu cầu từ khách hàng:
[NHẬP LĨNH VỰC/THƯƠNG HIỆU TẠI ĐÂY - Ví dụ: "Phòng khám nha khoa Smile tại Hà Nội"]`;

const SAMPLE_JSON = `{
  "title": "Nha Khoa Smile - Mẫu Website Phòng Khám Cao Cấp",
  "description": "<p>Giao diện thiết kế chuyên biệt cho phòng khám nha khoa hiện đại. Sở hữu tone màu xanh y tế sang trọng kết hợp bố cục chuẩn UI/UX giúp xây dựng lòng tin tuyệt đối từ khách hàng ngay từ lần đầu truy cập.</p><p>Website được tối ưu hóa tốc độ tải trang cực nhanh, đạt chuẩn SEO Google 100%. Tích hợp sẵn form đăng ký khám bệnh thông minh giúp tăng tỷ lệ chuyển đổi đặt lịch lên tới 40%.</p>",
  "previewUrl": "https://demo.dohy.vn/nha-khoa-smile",
  "tags": "Nha khoa & Y tế, Phòng khám, Tối ưu chuyển đổi",
  "stats": [
    { "label": "Sections", "value": 11 },
    { "label": "Trang mẫu", "value": 6 },
    { "label": "Popup", "value": 1 },
    { "label": "Biểu mẫu", "value": 2 }
  ],
  "features": "Thiết kế chuẩn UI/UX y khoa, Tốc độ load tối ưu, Chuẩn SEO Google 100%, Form đăng ký thông minh, Tương thích 100% di động"
}`;

export function AiWebDemoImportDialog({ onApply }: AiWebDemoImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Validate JSON đầu vào
  const validationResult = useMemo(() => {
    if (!rawInput.trim()) return { isValid: false, errors: [], data: null };

    try {
      // Làm sạch markdown block nếu có
      let cleaned = rawInput.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "");
      }
      
      const parsed = JSON.parse(cleaned);
      const errors: string[] = [];

      // Kiểm tra các trường bắt buộc
      if (!parsed.title) {
        errors.push("Thiếu thông tin 'title' (Tiêu đề giao diện).");
      }

      // Chuẩn hóa stats
      const rawStats = Array.isArray(parsed.stats) ? parsed.stats : [];
      const stats: { label: string; value: string }[] = rawStats
        .slice(0, 4)
        .map((s: any) => ({
          label: String(s?.label || "").trim(),
          value: String(Number(s?.value) || 0),
        }))
        .filter((s: any) => s.label);

      const normalizedData: Partial<WebDemoFormValues> = {
        title: String(parsed.title || "").trim(),
        slug: parsed.slug ? String(parsed.slug).trim() : undefined,
        summary: "",
        description: String(parsed.description || "").trim(),
        previewUrl: String(parsed.previewUrl || "").trim(),
        tags: String(parsed.tags || "").trim(),
        features: String(parsed.features || "").trim(),
        stats,
      };

      return {
        isValid: errors.length === 0,
        errors,
        data: normalizedData,
      };
    } catch (err) {
      return {
        isValid: false,
        errors: ["JSON không đúng định dạng. Hãy kiểm tra lại cú pháp (ngoặc, dấu phẩy, nháy kép)."],
        data: null,
      };
    }
  }, [rawInput]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEMPLATE);
      setCopied(true);
      toast.success("Đã copy Prompt mẫu vào Clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể copy. Hãy chọn tay toàn bộ Prompt và copy.");
    }
  };

  const handleApply = () => {
    if (validationResult.isValid && validationResult.data) {
      onApply(validationResult.data);
      setOpen(false);
      setRawInput("");
      toast.success("Đã điền dữ liệu AI vào Form!");
    } else {
      toast.error("Dữ liệu JSON chưa hợp lệ, vui lòng kiểm tra.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2 border-indigo-500/30 hover:border-indigo-500/80">
          <Bot className="h-4 w-4 text-indigo-600 animate-pulse" /> Import bằng AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <Bot className="h-5 w-5" /> Nhập thông tin Web Demo bằng AI (Chuyển đổi cao)
          </DialogTitle>
          <DialogDescription>
            Sao chép Prompt hướng dẫn dưới đây sang ChatGPT/Claude để AI soạn thảo nội dung trọng tâm, siêu gọn gàng rồi dán JSON vào ô phía dưới.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {/* Step 1: Copy prompt */}
          <div className="rounded-lg border border-border p-4 bg-muted/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Bước 1: Copy prompt hướng dẫn cho AI
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyPrompt} className="h-7 text-xs gap-1.5 border-indigo-500/20 text-indigo-600 hover:bg-indigo-50">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Clipboard className="h-3 w-3" />}
                {copied ? "Đã copy" : "Copy Prompt"}
              </Button>
            </div>
            <pre className="text-[11px] leading-relaxed max-h-32 overflow-y-auto p-2 bg-background border rounded border-border text-muted-foreground select-all font-mono whitespace-pre-wrap">
              {PROMPT_TEMPLATE}
            </pre>
          </div>

          {/* Step 2: Paste JSON */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Bước 2: Dán chuỗi JSON kết quả từ AI
            </span>
            <Textarea
              placeholder={`Dán chuỗi JSON gọn gàng của bạn vào đây...\nVí dụ:\n${SAMPLE_JSON}`}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="font-mono text-xs h-48 focus-visible:ring-1"
            />
          </div>

          {/* Validation alert */}
          {rawInput.trim() && (
            <div
              className={cn(
                "p-3 rounded-lg border flex gap-2 text-xs",
                validationResult.isValid
                  ? "bg-green-50/50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900"
                  : "bg-red-50/50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900"
              )}
            >
              {validationResult.isValid ? (
                <>
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Dữ liệu JSON hợp lệ!</span> Có thể áp dụng ngay vào form.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Có lỗi dữ liệu:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono">
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={handleApply} disabled={!validationResult.isValid} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Áp dụng vào Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
