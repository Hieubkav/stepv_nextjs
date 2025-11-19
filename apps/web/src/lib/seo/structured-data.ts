export type JsonLdType = Record<string, unknown> & { '@context': string; '@type': string };

export function createOrganizationSchema(): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DOHY Media',
    alternateName: 'DOHY',
    url: 'https://dohymedia.com',
    logo: 'https://dohymedia.com/logo.png',
    description: 'Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp',
    sameAs: [
      'https://facebook.com/dohymedia',
      'https://instagram.com/dohymedia',
      'https://youtube.com/@dohymedia',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@dohymedia.com',
      availableLanguage: 'vi',
    },
  };
}

export function createCourseSchema(course: {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  price?: number | null;
  pricingType?: 'free' | 'paid';
  imageUrl?: string;
  lessonsCount?: number;
  durationSeconds?: number;
}): JsonLdType {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dohymedia.com';
  const courseUrl = `${baseUrl}/khoa-hoc/${course.slug}`;
  const duration = course.durationSeconds ? `PT${Math.floor(course.durationSeconds / 60)}M` : undefined;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    url: courseUrl,
    description: course.description || course.subtitle || 'Khóa học từ DOHY Media',
    provider: {
      '@type': 'Organization',
      name: 'DOHY Media',
      url: baseUrl,
    },
  };

  if (course.imageUrl) {
    schema.image = course.imageUrl;
  }

  if (course.pricingType === 'free') {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: '0',
      availability: 'https://schema.org/InStock',
    };
  } else if (course.pricingType === 'paid' && course.price) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: course.price.toString(),
      availability: 'https://schema.org/InStock',
    };
  }

  if (duration) {
    schema.duration = duration;
  }

  if (course.lessonsCount) {
    schema.numberOfLessons = course.lessonsCount;
  }

  return schema as JsonLdType;
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createWebsiteSchema(): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DOHY Media',
    url: 'https://dohymedia.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://dohymedia.com/khoa-hoc?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createAggregateRatingSchema(courseTitle: string): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '128',
    reviewCount: '128',
    bestRating: '5',
    worstRating: '1',
    name: courseTitle,
  };
}
