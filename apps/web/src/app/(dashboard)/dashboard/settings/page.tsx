"use client";

// KISS: Trang Settings đơn giản cho site (key='site')
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  // Load settings 'site'
  const site = useQuery(api.settings.getByKey, { key: "site" });
  const upsert = useMutation(api.settings.upsert);

  // Form state đơn giản (KISS)
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [theme, setTheme] = useState("default");
  const [address, setAddress] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [pinterestUrl, setPinterestUrl] = useState("");
  // Raw JSON (nâng cao)
  const [rawJson, setRawJson] = useState("");
  const [useRaw, setUseRaw] = useState(false);

  // Đồng bộ từ server
  useEffect(() => {
    if (!site) return;
    const v: any = site.value ?? {};
    setSiteName(v.siteName ?? "");
    setLogoUrl(v.logoUrl ?? "");
    setContactEmail(v.contactEmail ?? "");
    setTheme(v.theme ?? "default");
    setAddress(v.address ?? "");
    setZaloUrl(v.zaloUrl ?? "");
    setFacebookUrl(v.facebookUrl ?? "");
    setInstagramUrl(v.instagramUrl ?? "");
    setXUrl(v.xUrl ?? "");
    setYoutubeUrl(v.youtubeUrl ?? "");
    setTiktokUrl(v.tiktokUrl ?? "");
    setPinterestUrl(v.pinterestUrl ?? "");
    setRawJson(JSON.stringify(v, null, 2));
  }, [site?._id, site?.updatedAt]);

  async function onSave() {
    try {
      let value: any;
      if (useRaw) {
        try {
          value = JSON.parse(rawJson || "{}");
        } catch (e: any) {
          toast.error("JSON không hợp lệ");
          return;
        }
      } else {
        value = { siteName, logoUrl, contactEmail, theme, address, zaloUrl, facebookUrl, instagramUrl, xUrl, youtubeUrl, tiktokUrl, pinterestUrl };
      }
      await upsert({ key: "site", value });
      toast.success("Đã lưu Settings");
    } catch (e: any) {
      toast.error("Lưu thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-1">Cấu hình toàn site (key = 'site').</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Dohy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/logo.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="default" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số 1, Đường ABC, Quận 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zaloUrl">Link Zalo</Label>
            <Input id="zaloUrl" value={zaloUrl} onChange={(e) => setZaloUrl(e.target.value)} placeholder="https://zalo.me/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Link Facebook</Label>
            <Input id="facebookUrl" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Link Instagram</Label>
            <Input id="instagramUrl" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xUrl">Link X</Label>
            <Input id="xUrl" value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">Link YouTube</Label>
            <Input id="youtubeUrl" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">Link TikTok</Label>
            <Input id="tiktokUrl" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/@..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pinterestUrl">Link Pinterest</Label>
            <Input id="pinterestUrl" value={pinterestUrl} onChange={(e) => setPinterestUrl(e.target.value)} placeholder="https://pinterest.com/..." />
          </div>
        </CardContent>
        <CardFooter className="gap-2 flex-col items-start">
          <div className="flex items-center gap-2 text-sm">
            <input id="useRaw" type="checkbox" checked={useRaw} onChange={(e) => setUseRaw(e.target.checked)} />
            <label htmlFor="useRaw">Chỉnh bằng JSON</label>
          </div>
          {useRaw && (
            <Textarea rows={10} value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
          )}
          <div className="mt-3">
            <Button onClick={onSave}>Lưu</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
