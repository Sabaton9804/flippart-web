/** SEO técnico: meta absolutas, JSON-LD y FAQ schema */
function initSEO() {
  const base = (typeof FLIPPART_CONFIG !== 'undefined' && FLIPPART_CONFIG.siteUrl)
    ? FLIPPART_CONFIG.siteUrl.replace(/\/$/, '')
    : window.location.origin;

  const setMeta = (selector, content) => {
    document.querySelectorAll(selector).forEach((el) => { el.content = content; });
  };

  const setLink = (selector, href) => {
    document.querySelectorAll(selector).forEach((el) => { el.href = href; });
  };

  setMeta('meta[property="og:image"], meta[name="twitter:image"]', `${base}/assets/og-image.jpg`);
  setMeta('meta[property="og:url"]', `${base}/`);
  setLink('#canonical-url', `${base}/`);
  setLink('link[rel="alternate"][hreflang="es-CO"]', `${base}/`);
  setLink('link[rel="alternate"][hreflang="x-default"]', `${base}/`);

  if (typeof FLIPPART_CONFIG !== 'undefined' && FLIPPART_CONFIG.googleSiteVerification) {
    let verify = document.querySelector('meta[name="google-site-verification"]');
    if (!verify) {
      verify = document.createElement('meta');
      verify.name = 'google-site-verification';
      document.head.appendChild(verify);
    }
    verify.content = FLIPPART_CONFIG.googleSiteVerification;
  }

  const graph = buildStructuredData(base);
  let script = document.getElementById('structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(graph);
}

function buildFaqItems() {
  return [...document.querySelectorAll('.faq__item')].map((item) => {
    const question = item.querySelector('summary')?.textContent?.trim();
    const answer = item.querySelector('p')?.textContent?.trim();
    if (!question || !answer) return null;
    return {
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    };
  }).filter(Boolean);
}

function buildReviews() {
  return [...document.querySelectorAll('.testimonial')].map((item) => {
    const author = item.querySelector('footer strong')?.textContent?.trim();
    const body = item.querySelector('p')?.textContent?.trim()?.replace(/^["“]|["”]$/g, '');
    if (!author || !body) return null;
    return {
      '@type': 'Review',
      author: { '@type': 'Person', name: author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: body,
    };
  }).filter(Boolean);
}

function buildVideoItems(base) {
  const videos = [...document.querySelectorAll('#processVideos video[src]')];
  return videos.map((video, index) => {
    const title = video.closest('.video-card')?.querySelector('p')?.textContent?.trim()
      || `Proceso artesanal FlippArt ${index + 1}`;
    const src = video.getAttribute('src');
    if (!src) return null;
    const url = src.startsWith('http') ? src : `${base}/${src.replace(/^\//, '')}`;
    return {
      '@type': 'VideoObject',
      name: title,
      description: 'Video del proceso artesanal de creación de figuras personalizadas FlippArt.',
      contentUrl: url,
      thumbnailUrl: `${base}/assets/hero/familia-carolina-vitrina.jpg`,
      uploadDate: '2026-01-01',
      inLanguage: 'es-CO',
    };
  }).filter(Boolean);
}

function buildStructuredData(base) {
  const faqItems = buildFaqItems();
  const reviews = buildReviews();
  const videos = buildVideoItems(base);

  const localBusiness = {
    '@type': 'LocalBusiness',
    '@id': `${base}/#business`,
    name: 'FlippArt',
    url: `${base}/`,
    image: `${base}/assets/og-image.jpg`,
    logo: `${base}/assets/logo/logo.jpeg`,
    description: 'Figuras personalizadas de mascotas y familias con vitrina LED. Conmemora momentos especiales con arte hecho a mano en Colombia.',
    telephone: '+57-318-294-1864',
    priceRange: '$$',
    currenciesAccepted: 'COP',
    paymentAccepted: 'Nequi, Daviplata, Transferencia',
    areaServed: { '@type': 'Country', name: 'Colombia' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bogotá',
      addressRegion: 'Cundinamarca',
      addressCountry: 'CO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 4.6097,
      longitude: -74.0817,
    },
    sameAs: [
      'https://instagram.com/Flippart.oficial',
      'https://wa.me/573182941864',
    ],
    parentOrganization: { '@id': `${base}/#organization` },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Figuras personalizadas FlippArt',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Figura personalizada de mascota',
            description: 'Memorial y homenaje para mascotas con vitrina LED y base iluminada.',
            areaServed: 'Colombia',
          },
          price: '250000',
          priceCurrency: 'COP',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Figura personalizada de familia o persona',
            description: 'Retratos y composiciones familiares para conmemorar momentos especiales.',
            areaServed: 'Colombia',
          },
          price: '250000',
          priceCurrency: 'COP',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Modelos históricos y coleccionables',
            description: 'Piezas conceptuales de alto detalle para coleccionistas.',
            areaServed: 'Colombia',
          },
        },
      ],
    },
  };

  if (reviews.length) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: String(reviews.length),
      bestRating: '5',
    };
    localBusiness.review = reviews;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: 'FlippArt',
        url: `${base}/`,
        logo: `${base}/assets/logo/logo.jpeg`,
        image: `${base}/assets/og-image.jpg`,
        description: 'Figuras personalizadas de mascotas, familias y recuerdos hechas a mano en Colombia.',
        sameAs: [
          'https://instagram.com/Flippart.oficial',
          'https://wa.me/573182941864',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+57-318-294-1864',
          contactType: 'customer service',
          areaServed: 'CO',
          availableLanguage: ['Spanish'],
        },
      },
      localBusiness,
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: 'FlippArt',
        description: 'Figuras personalizadas de mascotas y familias en Colombia',
        inLanguage: 'es-CO',
        publisher: { '@id': `${base}/#organization` },
        potentialAction: {
          '@type': 'ContactAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://wa.me/573182941864',
            actionPlatform: [
              'http://schema.org/MobileWebPlatform',
              'http://schema.org/DesktopWebPlatform',
            ],
          },
          name: 'Cotizar por WhatsApp',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${base}/#webpage`,
        url: `${base}/`,
        name: 'Figuras Personalizadas de Mascotas y Familias en Colombia | FlippArt',
        description: 'Figuras personalizadas de mascotas y familias para conmemorar momentos. Vitrina LED, unboxing premium y envío a Colombia.',
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': `${base}/#business` },
        inLanguage: 'es-CO',
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${base}/assets/og-image.jpg`,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${base}/#services`,
        name: 'Servicios FlippArt',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Figuras personalizadas de mascotas' },
          { '@type': 'ListItem', position: 2, name: 'Figuras de personas y familias' },
          { '@type': 'ListItem', position: 3, name: 'Reconocimientos y profesiones' },
          { '@type': 'ListItem', position: 4, name: 'Modelos históricos y coleccionables' },
        ],
      },
      ...(faqItems.length ? [{
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        mainEntity: faqItems,
      }] : []),
      ...videos,
    ],
  };
}
