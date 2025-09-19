export type BlockData = Record<string, unknown>;

export type HomeBlock = {
  _id: unknown;
  kind: string;
  data?: BlockData | null;
};

export type SiteHeaderMenuItem = { label?: string; url?: string; highlight?: boolean };
export type SiteHeaderSocial = { platform?: string; url?: string; icon?: string };
export type SiteHeaderCta = { label?: string; url?: string };
export type SiteHeaderProps = {
  logo?: string;
  backgroundImage?: string;
  menuItems?: SiteHeaderMenuItem[];
  socials?: SiteHeaderSocial[];
  cta?: SiteHeaderCta;
};

export type SiteFooterLink = { label?: string; url?: string; highlight?: boolean };
export type SiteFooterColumn = { title?: string; links?: SiteFooterLink[] };
export type SiteFooterSocialLink = { platform?: string; url?: string; icon?: string };
export type SiteFooterButton = { label?: string; url?: string };
export type SiteFooterProps = {
  logo?: string;
  title?: string;
  description?: string;
  button?: SiteFooterButton;
  columns?: SiteFooterColumn[];
  socialTitle?: string;
  socialLinks?: SiteFooterSocialLink[];
  locationTitle?: string;
  locationLines?: string[];
  contactTitle?: string;
  contactEmail?: string;
  copyright?: string;
};

const cleanProps = <T extends Record<string, unknown>>(input: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
};

const toString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const result = (value as unknown[])
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
  return result.length > 0 ? result : undefined;
};

const toAssetUrl = (value: unknown): string | undefined => {
  const direct = toString(value);
  if (direct) return direct;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return toString(record.url) ?? toString(record.href) ?? toString(record.src);
  }
  return undefined;
};

const collectEntries = (value: unknown): unknown[] | undefined => {
  const result: unknown[] = [];
  const visited = new Set<unknown>();

  const visit = (input: unknown) => {
    if (input === undefined || input === null) return;
    if (typeof input === 'function') return;
    if (typeof input === 'string') {
      result.push(input);
      return;
    }
    if (visited.has(input)) return;
    if (Array.isArray(input)) {
      visited.add(input);
      input.forEach(visit);
      return;
    }
    if (typeof input === 'object') {
      visited.add(input);
      const record = input as Record<string, unknown>;
      const hasContent =
        'label' in record ||
        'title' in record ||
        'text' in record ||
        'name' in record ||
        'url' in record ||
        'href' in record ||
        'link' in record ||
        'path' in record ||
        'to' in record ||
        'platform' in record ||
        'icon' in record ||
        'iconName' in record;
      if (hasContent) {
        result.push(record);
        return;
      }
      Object.values(record).forEach(visit);
    }
  };

  visit(value);
  return result.length > 0 ? result : undefined;
};

export function mapSiteHeaderProps(data?: BlockData | null): Partial<SiteHeaderProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const menuSource =
    collectEntries(record.menuItems) ??
    collectEntries(record.menu) ??
    collectEntries(record.navigation) ??
    collectEntries(record.links) ??
    collectEntries(record.items);

  const menuItems = menuSource
    ? menuSource
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') {
            return { label: item } as SiteHeaderMenuItem;
          }
          if (typeof item !== 'object') return null;
          const itemRecord = item as Record<string, unknown>;
          const label =
            toString(itemRecord.label) ??
            toString(itemRecord.title) ??
            toString(itemRecord.text) ??
            toString(itemRecord.name);
          if (!label) return null;

          const rawUrl =
            itemRecord.url ??
            itemRecord.href ??
            itemRecord.link ??
            itemRecord.path ??
            itemRecord.to;
          const url = toAssetUrl(rawUrl) ?? toString(rawUrl);
          const highlight =
            toBoolean(itemRecord.highlight) ??
            toBoolean(itemRecord.isHighlighted) ??
            toBoolean(itemRecord.active) ??
            toBoolean(itemRecord.isActive);

          const menuItem: SiteHeaderMenuItem = { label };
          if (url) menuItem.url = url;
          if (highlight !== undefined) menuItem.highlight = highlight;
          return menuItem;
        })
        .filter((item): item is SiteHeaderMenuItem => item !== null && !!item.label)
    : undefined;

  const socialSource =
    collectEntries(record.socials) ??
    collectEntries(record.socialLinks) ??
    collectEntries(record.socialIcons) ??
    collectEntries(record.links);

  const socials = socialSource
    ? socialSource
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') {
            return { platform: item, url: item } as SiteHeaderSocial;
          }
          if (typeof item !== 'object') return null;
          const socialRecord = item as Record<string, unknown>;
          const url = toAssetUrl(socialRecord.url ?? socialRecord.href ?? socialRecord.link);
          if (!url) return null;
          const platform =
            toString(socialRecord.platform) ??
            toString(socialRecord.label) ??
            toString(socialRecord.name);
          const icon = toString(socialRecord.icon) ?? toString(socialRecord.iconName);
          const social: SiteHeaderSocial = { url };
          if (platform) social.platform = platform;
          if (icon) social.icon = icon;
          return social;
        })
        .filter((social): social is SiteHeaderSocial => social !== null && !!social.url)
    : undefined;

  const ctaValue = record.cta ?? record.callToAction ?? record.button ?? record.primaryCta;
  const cta = (() => {
    if (!ctaValue) return undefined;
    if (typeof ctaValue === 'string') {
      return { label: ctaValue, url: '#contact' } as SiteHeaderCta;
    }
    if (typeof ctaValue !== 'object') return undefined;
    const ctaRecord = ctaValue as Record<string, unknown>;
    const label =
      toString(ctaRecord.label) ??
      toString(ctaRecord.text) ??
      toString(ctaRecord.title);
    if (!label) return undefined;
    const url =
      toAssetUrl(ctaRecord.url ?? ctaRecord.href ?? ctaRecord.link) ??
      toString(ctaRecord.url) ??
      toString(ctaRecord.href) ??
      toString(ctaRecord.link);
    const result: SiteHeaderCta = { label };
    if (url) result.url = url;
    return result;
  })();

  return cleanProps<SiteHeaderProps>({
    logo:
      toAssetUrl(record.logo) ??
      toAssetUrl(record.logoUrl) ??
      toAssetUrl(record.logoImage) ??
      toAssetUrl(record.brandLogo),
    backgroundImage:
      toAssetUrl(record.backgroundImage) ??
      toAssetUrl(record.background) ??
      toAssetUrl(record.heroImage) ??
      toAssetUrl(record.coverImage),
    menuItems,
    socials,
    cta,
  });
}

export function mapSiteFooterProps(data?: BlockData | null): Partial<SiteFooterProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const buttonValue = record.button ?? record.cta ?? record.callToAction;
  const button =
    buttonValue && typeof buttonValue === 'object'
      ? (() => {
          const buttonRecord = buttonValue as Record<string, unknown>;
          const label = toString(buttonRecord.label);
          if (!label) return undefined;
          const url = toString(buttonRecord.url) ?? toString(buttonRecord.href);
          const result: SiteFooterButton = { label };
          if (url) result.url = url;
          return result;
        })()
      : undefined;

  const linksFrom = (value: unknown): SiteFooterLink[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const links = (value as unknown[])
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const linkRecord = item as Record<string, unknown>;
        const label = toString(linkRecord.label);
        if (!label) return null;
        const url = toString(linkRecord.url) ?? toString(linkRecord.href);
        const highlight = toBoolean(linkRecord.highlight);
        const link: SiteFooterLink = { label };
        if (url) link.url = url;
        if (highlight !== undefined) link.highlight = highlight;
        return link;
      })
      .filter((link): link is SiteFooterLink => link !== null);
    return links.length > 0 ? links : undefined;
  };

  const columnsSource = Array.isArray(record.columns)
    ? (record.columns as unknown[])
    : Array.isArray(record.sections)
      ? (record.sections as unknown[])
      : undefined;

  const columns = columnsSource
    ? columnsSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const columnRecord = item as Record<string, unknown>;
          const title = toString(columnRecord.title);
          const links = linksFrom(columnRecord.links ?? columnRecord.items);
          if (!title && !links) return null;
          const column: SiteFooterColumn = {};
          if (title) column.title = title;
          if (links) column.links = links;
          return column;
        })
        .filter((column): column is SiteFooterColumn => column !== null)
    : undefined;

  const socialSource = Array.isArray(record.socialLinks)
    ? (record.socialLinks as unknown[])
    : Array.isArray(record.socials)
      ? (record.socials as unknown[])
      : undefined;

  const socialLinks = socialSource
    ? socialSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const socialRecord = item as Record<string, unknown>;
          const url = toString(socialRecord.url);
          if (!url) return null;
          const platform = toString(socialRecord.platform) ?? toString(socialRecord.label);
          const icon = toString(socialRecord.icon);
          const social: SiteFooterSocialLink = { url };
          if (platform) social.platform = platform;
          if (icon) social.icon = icon;
          return social;
        })
        .filter((social): social is SiteFooterSocialLink => social !== null)
    : undefined;

  const locationLines =
    toStringArray(record.locationLines) ??
    (() => {
      const locationValue = toString(record.location) ?? toString(record.address);
      if (!locationValue) return undefined;
      const lines = locationValue
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      return lines.length > 0 ? lines : undefined;
    })();

  return cleanProps<SiteFooterProps>({
    logo: toString(record.logo) ?? toString(record.logoUrl) ?? toString(record.logoImage),
    title: toString(record.title),
    description: toString(record.description),
    button,
    columns,
    socialTitle: toString(record.socialTitle) ?? toString(record.followUsTitle),
    socialLinks,
    locationTitle: toString(record.locationTitle),
    locationLines,
    contactTitle: toString(record.contactTitle),
    contactEmail: toString(record.contactEmail) ?? toString(record.email),
    copyright: toString(record.copyright),
  });
}

export function partitionSiteLayoutBlocks(blocks: HomeBlock[]) {
  let headerBlock: HomeBlock | undefined;
  let footerBlock: HomeBlock | undefined;
  const contentBlocks: HomeBlock[] = [];

  blocks.forEach((block) => {
    if (!headerBlock && block.kind === 'siteHeader') {
      headerBlock = block;
      return;
    }
    if (!footerBlock && block.kind === 'siteFooter') {
      footerBlock = block;
      return;
    }
    contentBlocks.push(block);
  });

  return { headerBlock, footerBlock, contentBlocks } as const;
}
