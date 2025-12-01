export type JsonLdType = Record<string, unknown> & { '@context': string; '@type': string };

export function createOrganizationSchema(): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DOHY Media',
    alternateName: 'DOHY',
    url: 'https://dohymedia.com',
    logo: 'https://dohymedia.com/logo.png',
    description: 'Dịch vụ dựng hình 3D chuyên nghiệp và render kiến trúc siêu thực. Studio làm hoạt hình 3D, dựng mô phỏng sản phẩm 3D quảng cáo.',
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

export function createServiceSchema(service: {
  name: string;
  description: string;
  url?: string;
  image?: string;
  provider?: string;
  keywords?: string[];
}): JsonLdType {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dohymedia.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: service.name,
    description: service.description,
    url: service.url || baseUrl,
    image: service.image,
    provider: {
      '@type': 'Organization',
      name: service.provider || 'DOHY Media',
      url: baseUrl,
    },
    keywords: service.keywords?.join(', ') || 'dịch vụ dựng hình 3D, render kiến trúc siêu thực',
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    availableLanguage: ['Vietnamese', 'English'],
  };
}

export function createHome3DServiceSchemas(): JsonLdType[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dohymedia.com';
  
  const services = [
    {
      name: 'Làm phim hoạt hình 3D chuyên nghiệp',
      description: 'Studio làm hoạt hình 3D chuyên nghiệp với đội ngũ chuyên gia giàu kinh nghiệm. Cung cấp dịch vụ dựng phim hoạt hình 3D từ lên ý tưởng đến sản xuất hoàn chỉnh.',
      url: `${baseUrl}/projects`,
      keywords: ['làm phim hoạt hình 3D', 'studio làm hoạt hình 3D', 'dựng phim hoạt hình 3D']
    },
    {
      name: 'Dựng mô hình 3D theo yêu cầu',
      description: 'Chuyên dựng mô phỏng sản phẩm 3D quảng cáo và làm mô hình 3D theo yêu cầu. Dịch vụ render nhanh 3D giúp tạo ra hình ảnh sống động, chân thực.',
      url: `${baseUrl}/projects`,
      keywords: ['dựng mô phỏng sản phẩm 3D', 'làm mô hình 3D theo yêu cầu', 'dịch vụ render nhanh 3D']
    },
    {
      name: 'Thư viện VFX và render kiến trúc siêu thực',
      description: 'Cung cấp Thư viện VFX chuyên nghiệp và dịch vụ render kiến trúc siêu thực với công nghệ photorealistic đỉnh cao.',
      url: `${baseUrl}/projects`,
      keywords: ['Thư viện VFX', 'render kiến trúc siêu thực', 'dựng 3D siêu thực – photorealistic']
    },
    {
      name: 'Làm 3D marketing cho doanh nghiệp',
      description: 'Chuyên làm video 3D quảng cáo và thiết kế 3D sản phẩm mỹ phẩm chuyên nghiệp. Dịch vụ làm 3D marketing cho doanh nghiệp giúp nâng cao hiệu quả chiến dịch.',
      url: `${baseUrl}/projects`,
      keywords: ['làm 3D marketing cho doanh nghiệp', 'làm video 3D quảng cáo', 'thiết kế 3D sản phẩm mỹ phẩm']
    },
    {
      name: 'Thiết kế kiến trúc 3D & nội thất',
      description: 'Chuyên thiết kế kiến trúc 3D, dựng nội thất 3D giá rẻ và thiết kế 3D ngoại thất chuyên nghiệp. Dựng phối cảnh kiến trúc giúp hình dung không gian sống.',
      url: `${baseUrl}/projects`,
      keywords: ['thiết kế kiến trúc 3D', 'dựng nội thất 3D giá rẻ', 'thiết kế 3D ngoại thất', 'dựng phối cảnh kiến trúc']
    },
    {
      name: 'Khóa học đồ họa 3D chuyên nghiệp',
      description: 'Cung cấp khóa học đồ họa 3D từ cơ bản đến nâng cao. Đào tạo chuyên sâu về dựng hình 3D, render, và animation.',
      url: `${baseUrl}/khoa-hoc`,
      keywords: ['khóa học đồ họa 3D', 'học dựng hình 3D', 'đào tạo đồ họa 3D']
    }
  ];

  return services.map(service => createServiceSchema({
    ...service,
    provider: 'DOHY Media'
  }));
}

export function createLocalBusinessSchema(): JsonLdType {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'DOHY Media - Dịch vụ dựng hình 3D chuyên nghiệp',
    description: 'Chuyên cung cấp dịch vụ dựng hình 3D, render kiến trúc siêu thực, studio làm hoạt hình 3D, khóa học đồ họa 3D. Làm hình ảnh 3D chuyên nghiệp cho doanh nghiệp.',
    url: 'https://dohymedia.com',
    telephone: '+84XXXXXXXXX',
    email: 'support@dohymedia.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Vietnam',
      addressLocality: 'Ho Chi Minh City',
    },
    openingHours: 'Mo-Fr 09:00-18:00',
    priceRange: '$$',
    paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'VND',
    keywords: [
      'dịch vụ dựng hình 3D',
      'làm hình ảnh 3D chuyên nghiệp',
      'render kiến trúc siêu thực',
      'studio làm hoạt hình 3D',
      'khóa học đồ họa 3D'
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    serviceType: [
      '3D Animation Services',
      '3D Modeling Services',
      '3D Rendering Services',
      '3D Design Training',
      'Visual Effects Services'
    ]
  };
}
