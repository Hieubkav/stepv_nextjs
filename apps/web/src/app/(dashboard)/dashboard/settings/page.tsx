"use client";

// KISS: Trang Settings don gian cho site (key='site')
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
    // Load settings 'site'
    const site = useQuery(api.settings.getByKey, { key: "site" });
    const upsert = useMutation(api.settings.upsert);

    // Form state don gian (KISS)
    const [siteName, setSiteName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [address, setAddress] = useState("");
    const [zaloUrl, setZaloUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [xUrl, setXUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [tiktokUrl, setTiktokUrl] = useState("");
    const [pinterestUrl, setPinterestUrl] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankCode, setBankCode] = useState("");
    // Raw JSON (nang cao)
    const [rawJson, setRawJson] = useState("");
    const [useRaw, setUseRaw] = useState(false);
    const [logoPickerOpen, setLogoPickerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dong bo tu server
    useEffect(() => {
        if (!site) return;
        const v: any = site.value ?? {};
        setSiteName(v.siteName ?? "");
        setLogoUrl(v.logoUrl ?? "");
        setContactEmail(v.contactEmail ?? "");
        setAddress(v.address ?? "");
        setZaloUrl(v.zaloUrl ?? "");
        setFacebookUrl(v.facebookUrl ?? "");
        setInstagramUrl(v.instagramUrl ?? "");
        setXUrl(v.xUrl ?? "");
        setYoutubeUrl(v.youtubeUrl ?? "");
        setTiktokUrl(v.tiktokUrl ?? "");
        setPinterestUrl(v.pinterestUrl ?? "");
        setBankAccountNumber(v.bankAccountNumber ?? "");
        setBankAccountName(v.bankAccountName ?? "");
        setBankCode(v.bankCode ?? "");
        setRawJson(JSON.stringify(v, null, 2));
    }, [site?._id, site?.updatedAt]);

    const handleLogoPicked = useCallback((media: MediaItem) => {
        if (!media?.url) {
            toast.error("Media không có URL hợp lệ");
            return;
        }
        setLogoUrl(media.url);
        setLogoPickerOpen(false);
    }, []);

    async function onSave() {
        try {
            setIsSaving(true);
            let value: any;
            if (useRaw) {
                try {
                    value = JSON.parse(rawJson || "{}");
                } catch (e: any) {
                    toast.error("JSON không hợp lệ");
                    return;
                }
            } else {
                value = { siteName, logoUrl, contactEmail, address, zaloUrl, facebookUrl, instagramUrl, xUrl, youtubeUrl, tiktokUrl, pinterestUrl, bankAccountNumber, bankAccountName, bankCode };
            }
            await upsert({ key: "site", value });
            toast.success("Đã lưu Settings");
        } catch (e: any) {
            toast.error("Lưu thất bại");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Cài đặt website</h1>
                <p className="text-sm text-muted-foreground">Điều chỉnh branding & thông tin liên lạc cho toàn site (key = "site").</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Nhận diện thương hiệu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SiteIdentityPreview siteName={siteName} logoUrl={logoUrl} />

                        <div className="space-y-2">
                            <Label htmlFor="siteName">Site name</Label>
                            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="DOHY Media" />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="logoUrl">Logo từ media</Label>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="h-16 w-16 rounded-xl border bg-muted/40 flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No logo</span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                                    <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => setLogoPickerOpen(true)}>
                                        Chọn ảnh từ media
                                    </Button>
                                    <Button type="button" variant="ghost" className="min-h-[44px]" disabled={!logoUrl} onClick={() => setLogoUrl("")}>
                                        Xóa logo
                                    </Button>
                                </div>
                            </div>
                            <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
                            <p className="text-xs text-muted-foreground">Logo này sẽ được dùng làm favicon và preview trên tab trình duyệt.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin liên lạc</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact email</Label>
                                    <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zaloUrl">Link Zalo</Label>
                                    <Input id="zaloUrl" value={zaloUrl} onChange={(e) => setZaloUrl(e.target.value)} placeholder="https://zalo.me/..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Textarea id="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số 1, Đường ABC, Quận 1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mạng xã hội</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <SocialField id="facebookUrl" label="Facebook" value={facebookUrl} onChange={setFacebookUrl} placeholder="https://facebook.com/..." />
                                <SocialField id="instagramUrl" label="Instagram" value={instagramUrl} onChange={setInstagramUrl} placeholder="https://instagram.com/..." />
                                <SocialField id="xUrl" label="X / Twitter" value={xUrl} onChange={setXUrl} placeholder="https://x.com/..." />
                                <SocialField id="youtubeUrl" label="YouTube" value={youtubeUrl} onChange={setYoutubeUrl} placeholder="https://youtube.com/..." />
                                <SocialField id="tiktokUrl" label="TikTok" value={tiktokUrl} onChange={setTiktokUrl} placeholder="https://tiktok.com/@..." />
                                <SocialField id="pinterestUrl" label="Pinterest" value={pinterestUrl} onChange={setPinterestUrl} placeholder="https://pinterest.com/..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin ngân hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
                                    <Input id="bankAccountNumber" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="1234567890" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountName">Tên chủ tài khoản</Label>
                                    <Input id="bankAccountName" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankCode">Mã ngân hàng</Label>
                                    <Input id="bankCode" value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="970012" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lưu ý & JSON nâng cao</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium">Chỉnh tay bằng JSON</p>
                                <p className="text-xs text-muted-foreground">Chỉ bật khi bạn muốn nhập tên field custom. Form sẽ bị bỏ qua.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Checkbox id="useRaw" checked={useRaw} onCheckedChange={(value) => setUseRaw(value === true)} />
                                <Label htmlFor="useRaw" className="text-sm">Dùng JSON</Label>
                            </div>
                        </div>
                        {useRaw ? (
                            <Textarea rows={12} value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Giá trị JSON sẽ được tạo từ các field ở trên.</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="default" className="min-w-[120px]" onClick={onSave} disabled={isSaving}>
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <MediaPickerDialog
                open={logoPickerOpen}
                onOpenChange={setLogoPickerOpen}
                title="Chọn logo từ media"
                onSelect={handleLogoPicked}
            />
        </div>
    );
}

function SiteIdentityPreview({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
    const fallback = useMemo(() => {
        if (siteName?.trim()) {
            return siteName.trim().slice(0, 2).toUpperCase();
        }
        return "DW";
    }, [siteName]);

    return (
        <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Preview tab</div>
            <div className="mt-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt="Favicon" className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-muted-foreground">{fallback}</span>}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{siteName || "Tên website"}</p>
                    <p className="text-xs text-muted-foreground truncate">{logoUrl || "Chưa chọn logo"}</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">Live</Badge>
            </div>
        </div>
    );
}

type SocialFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function SocialField({ id, label, value, onChange, placeholder }: SocialFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}
