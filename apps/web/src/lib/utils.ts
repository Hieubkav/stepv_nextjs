import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function stripHtml(html: string): string {
	if (!html) return "";
	// Remove HTML tags and decode entities
	return html
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/&nbsp;/g, " ") // Replace non-breaking spaces
		.replace(/&lt;/g, "<") // Decode &lt;
		.replace(/&gt;/g, ">") // Decode &gt;
		.replace(/&amp;/g, "&") // Decode &amp;
		.replace(/&quot;/g, '"') // Decode &quot;
		.replace(/&#039;/g, "'") // Decode &#039;
		.replace(/\s+/g, " ") // Replace multiple spaces with single space
		.trim();
}
