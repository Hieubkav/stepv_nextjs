import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { Geist, Geist_Mono } from "next/font/google";
import { api } from "@dohy/backend/convex/_generated/api";
import { baseMetadata } from "@/lib/seo/metadata";
import { createOrganizationSchema, createWebsiteSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

type SiteSettingValue = {
	logoUrl?: string;
};

export async function generateMetadata(): Promise<Metadata> {
	const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return baseMetadata;
	}

	try {
		const client = new ConvexHttpClient(convexUrl);
		const site = await client.query(api.settings.getByKey, { key: "site" });
		const value = (site?.value ?? {}) as SiteSettingValue;
		const logoUrl = typeof value.logoUrl === "string" ? value.logoUrl.trim() : "";

		if (!logoUrl) {
			return baseMetadata;
		}

		return {
			...baseMetadata,
			icons: { icon: logoUrl },
		};
	} catch (error) {
		console.warn("Không thể đồng bộ favicon từ site settings", error);
		return baseMetadata;
	}
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<head>
				<JsonLd data={[createOrganizationSchema(), createWebsiteSchema()]} />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
