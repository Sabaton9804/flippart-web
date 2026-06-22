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

function buildStructuredData(base) {
  const faqItems = [...document.querySelectorAll('.faq__item')].map((item) => {
    const question = item.querySelector('summary')?.textContent?.trim();
    const answer = item.querySelector('p')?.textContent?.trim();
    if (!question || !answer) return null;
    return {
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    };
  }).filter(Boolean);

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
          'https://wa.me/573156247293',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+57-315-624-7293',
          contactType: 'customer service',
          areaServed: 'CO',
          availableLanguage: ['Spanish'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${base}/#business`,
        name: 'FlippArt',
        url: `${base}/`,
        image: `${base}/assets/og-image.jpg`,
        logo: `${base}/assets/logo/logo.jpeg`,
        description: 'Figuras personalizadas de mascotas y familias con vitrina LED. Conmemora momentos especiales con arte hecho a mano en Colombia.',
        telephone: '+57-315-624-7293',
        priceRange: '$$',
        currenciesAccepted: 'COP',
        paymentAccepted: 'Nequi, Daviplata, Transferencia',
        areaServed: { '@type': 'Country', name: 'Colombia' },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bogotá',
          addressCountry: 'CO',
        },
        sameAs: ['https://instagram.com/Flippart.oficial'],
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
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: 'FlippArt',
        description: 'Figuras personalizadas de mascotas y familias en Colombia',
        inLanguage: 'es-CO',
        publisher: { '@id': `${base}/#organization` },
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
      },
      ...(faqItems.length ? [{
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        mainEntity: faqItems,
      }] : []),
    ],
  };
}
