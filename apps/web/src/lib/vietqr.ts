const VIETQR_BASE = "https://img.vietqr.io/image";

type BuildVietQRImageUrlParams = {
  bankCode: string | null | undefined;
  accountNumber: string | null | undefined;
  template?: string;
  amount?: number | null;
  addInfo?: string | null;
  accountName?: string | null;
};

/**
 * Build a VietQR Quick Link image URL from the provided bank information.
 * The default template uses `qr_only` as requested in product specs.
 */
export function buildVietQRImageUrl({
  bankCode,
  accountNumber,
  template = "qr_only",
  amount,
  addInfo,
  accountName,
}: BuildVietQRImageUrlParams): string | null {
  const trimmedBank = (bankCode ?? "").trim();
  const trimmedAccount = (accountNumber ?? "").trim();

  if (!trimmedBank || !trimmedAccount) {
    return null;
  }

  const normalizedTemplate = template.trim() || "qr_only";
  const segments = `${encodeURIComponent(trimmedBank)}-${encodeURIComponent(trimmedAccount)}-${encodeURIComponent(
    normalizedTemplate,
  )}`;
  const url = new URL(`${VIETQR_BASE}/${segments}.png`);

  if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
    url.searchParams.set("amount", Math.round(amount).toString());
  }

  if (addInfo?.trim()) {
    url.searchParams.set("addInfo", addInfo.trim());
  }

  if (accountName?.trim()) {
    url.searchParams.set("accountName", accountName.trim());
  }

  return url.toString();
}

export type BankConfig = {
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  bankCode?: string | null;
};

export function hasBankConfig(config: BankConfig | undefined | null): config is Required<BankConfig> {
  return Boolean(
    config &&
      typeof config.bankAccountNumber === "string" &&
      config.bankAccountNumber.trim() &&
      typeof config.bankAccountName === "string" &&
      config.bankAccountName.trim() &&
      typeof config.bankCode === "string" &&
      config.bankCode.trim(),
  );
}
