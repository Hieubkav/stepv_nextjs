/**
 * Format price to Vietnamese Dong format
 * @param price - Price in VND
 * @returns Formatted price string (e.g., "1,000,000đ")
 */
export function formatPrice(price: number | undefined): string {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Format percentage
 * @param percent - Percentage (0-100)
 * @returns Formatted string (e.g., "50%")
 */
export function formatPercent(percent: number | undefined): string {
    if (percent === undefined || percent === null) return '0%';
    return `${Math.round(percent)}%`;
}

/**
 * Format date to Vietnamese format
 * @param date - Date object or timestamp
 * @returns Formatted date string (e.g., "20/11/2025")
 */
export function formatDate(date: Date | number): string {
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN');
}
