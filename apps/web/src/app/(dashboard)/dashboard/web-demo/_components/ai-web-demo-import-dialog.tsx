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
import type { WebDemoFormValues, ReviewItem, BlockItem } from "./web-demo-form";

type AiWebDemoImportDialogProps = {
  onApply: (values: Partial<WebDemoFormValues>) => void;
};

const PROMPT_TEMPLATE = `Bạn là một chuyên gia viết nội dung chuyển đổi (Conversion Copywriter) và chuyên gia SEO cho các mẫu giao diện website (Web Demos / Themes).
Nhiệm vụ của bạn là viết thông tin chi tiết và dữ liệu cho một mẫu giao diện website dựa trên tên thương hiệu và lĩnh vực hoạt động do người dùng cung cấp.

Hãy viết nội dung bằng Tiếng Việt, mang tính thực tế, hấp dẫn, chuẩn SEO và xuất ra định dạng JSON chính xác theo cấu trúc dưới đây. Tuyệt đối không trả về bất kỳ văn bản giải thích nào khác ngoài chuỗi JSON sạch.

Cấu trúc JSON mong muốn:
{
  "title": "Tiêu đề giao diện (ví dụ: Dr. Thoang DermaCos Cần Thơ - Spa thảo dược & Trị liệu)",
  "summary": "Mô tả ngắn gọn hiển thị ngoài danh sách (khoảng 120-200 ký tự)",
  "description": "Mô tả chi tiết các tính năng, điểm nhấn giao diện và giá trị mang lại (khoảng 200-400 từ, định dạng có phân dòng)",
  "previewUrl": "URL xem thử demo (ví dụ: https://demo.dohy.vn/spa-an-nhien)",
  "tags": "Các tag phân tách bằng dấu phẩy (ví dụ: Spa & Làm đẹp, Trị liệu y tế, Cần Thơ)",
  "sections": 12, // Số lượng sections cấu thành trang (số nguyên)
  "pages": 8, // Số lượng trang con (số nguyên)
  "popups": 2, // Số lượng popup tích hợp (số nguyên)
  "forms": 3, // Số lượng form đăng ký/liên hệ (số nguyên)
  "features": "Đặc điểm nổi bật (mỗi đặc điểm viết trên 1 dòng mới, ví dụ:\\nTương thích 100% Mobile\\nTối ưu SEO Google\\nTích hợp đặt lịch online)",
  "blocks": [
    {
      "title": "Hero Banner chính",
      "description": "Banner chào mừng rực rỡ với nút đặt lịch nổi bật và slide ảnh dịch vụ."
    },
    {
      "title": "Bảng giá dịch vụ spa",
      "description": "Khối hiển thị danh sách các gói dịch vụ, giá tiền và mô tả ngắn gọn đi kèm."
    },
    {
      "title": "Form đăng ký tư vấn",
      "description": "Khối form thu thập thông tin khách hàng đặt lịch hẹn tự động gửi email."
    }
  ],
  "reviews": [
    {
      "name": "Nguyễn Thị Mai",
      "role": "Khách hàng thân thiết",
      "comment": "Giao diện chạy rất nhanh trên điện thoại, tôi đặt lịch hẹn massage chỉ mất 30 giây.",
      "rating": 5
    },
    {
      "name": "Trần Văn Bình",
      "role": "CEO Spa An Nhiên",
      "comment": "Trang web thiết kế sang trọng, khách hàng của tôi phản hồi rất tích cực kể từ khi thay đổi.",
      "rating": 5
    }
  ]
}

Thông tin yêu cầu từ khách hàng:
[NHẬP LĨNH VỰC/THƯƠNG HIỆU TẠI ĐÂY - Ví dụ: "Nha khoa quốc tế Smile tại Hà Nội"]`;

const SAMPLE_JSON = `{
  "title": "Nha Khoa Quốc Tế Smile Hà Nội",
  "summary": "Mẫu giao diện phòng khám nha khoa cao cấp, tối ưu trải nghiệm đặt lịch hẹn khám răng và hiển thị dịch vụ chuyên nghiệp.",
  "description": "Giao diện được thiết kế đặc thù cho các phòng khám răng hàm mặt hiện đại. Cung cấp đầy đủ các module giới thiệu bác sĩ, bảng giá dịch vụ niềng răng, bọc sứ, nhổ răng khôn cùng quy trình điều trị trực quan giúp gia tăng sự tin tưởng của bệnh nhân.\\n\\nTích hợp hệ thống form đặt lịch thông minh giúp lễ tân dễ dàng tiếp nhận thông tin.",
  "previewUrl": "https://demo.dohy.vn/nha-khoa-smile",
  "tags": "Nha khoa & Y tế, Phòng khám, Hà Nội",
  "sections": 11,
  "pages": 6,
  "popups": 1,
  "forms": 2,
  "features": "Đặt lịch hẹn trực tuyến\\nGiới thiệu bác sĩ chuyên khoa\\nBảng giá dịch vụ trực quan\\nChuẩn SEO y tế",
  "blocks": [
    {
      "title": "Banner đặt lịch khẩn cấp",
      "description": "Khối đầu trang hiển thị hotline và nút hẹn lịch nhanh."
    },
    {
      "title": "Showcase dịch vụ nổi bật",
      "description": "Grid hiển thị 6 dịch vụ nha khoa cốt lõi kèm icon sinh động."
    }
  ],
  "reviews": [
    {
      "name": "Bác sĩ Lê Hoàng",
      "role": "Giám đốc chuyên môn",
      "comment": "Website sạch sẽ, chuẩn y khoa và giúp chúng tôi tăng 40% lượng khách đặt lịch hẹn online.",
      "rating": 5
    }
  ]
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

      // Ép kiểu các giá trị số
      const sections = Number(parsed.sections) || 0;
      const pages = Number(parsed.pages) || 0;
      const popups = Number(parsed.popups) || 0;
      const forms = Number(parsed.forms) || 0;

      // Chuẩn hóa blocks
      const rawBlocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
      const blocks: BlockItem[] = rawBlocks.map((b: any) => ({
        title: String(b?.title || "").trim() || "Untitled Block",
        description: String(b?.description || "").trim(),
        imageId: String(b?.imageId || "").trim(),
      }));

      // Chuẩn hóa reviews
      const rawReviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
      const reviews: ReviewItem[] = rawReviews.map((r: any) => ({
        name: String(r?.name || "").trim() || "Khách hàng ẩn danh",
        role: String(r?.role || "").trim(),
        avatarUrl: String(r?.avatarUrl || "").trim(),
        comment: String(r?.comment || "").trim() || "Đánh giá tuyệt vời",
        rating: Math.max(1, Math.min(5, Number(r?.rating) || 5)),
      }));

      const normalizedData: Partial<WebDemoFormValues> = {
        title: String(parsed.title || "").trim(),
        slug: parsed.slug ? String(parsed.slug).trim() : undefined,
        summary: String(parsed.summary || "").trim(),
        description: String(parsed.description || "").trim(),
        previewUrl: String(parsed.previewUrl || "").trim(),
        tags: String(parsed.tags || "").trim(),
        sections: String(sections),
        pages: String(pages),
        popups: String(popups),
        forms: String(forms),
        features: String(parsed.features || "").trim(),
        blocks,
        reviews,
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
        <Button type="button" variant="outline" className="gap-2 border-primary/30 hover:border-primary/80">
          <Bot className="h-4 w-4 text-primary animate-pulse" /> Import bằng AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Nhập thông tin Web Demo bằng AI
          </DialogTitle>
          <DialogDescription>
            Sao chép Prompt hướng dẫn dưới đây sang ChatGPT/Claude để AI soạn thông tin, sau đó dán JSON kết quả vào ô phía dưới.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {/* Step 1: Copy prompt */}
          <div className="rounded-lg border border-border p-4 bg-muted/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Bước 1: Copy prompt hướng dẫn cho AI
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyPrompt} className="h-7 text-xs gap-1.5">
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
              placeholder={`Dán chuỗi JSON của bạn vào đây...\nVí dụ:\n${SAMPLE_JSON}`}
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
                    (Gồm: {validationResult.data?.blocks?.length || 0} Blocks và {validationResult.data?.reviews?.length || 0} Reviews mẫu).
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
          <Button type="button" onClick={handleApply} disabled={!validationResult.isValid}>
            Áp dụng vào Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
