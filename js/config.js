// =============================================
// BRAND CONFIGURATION — Edit this to customize
// =============================================
const CONFIG = {
  brand: {
    name: 'ORIVIZ',
    tagline: 'Lunettes fabriquées à la main inspirées par l\'art et la culture',
    description: 'Les lunettes ORIVIZ sont fabriquées à la main en acétate italien selon des designs intemporels inspirés par l\'art, la culture et des personnalités uniques.',
    logoUrl: '/images/logo.png',
    currency: 'DH',
    currencyCode: 'MAD',
  },

  colors: {
    background: '#000000',
    text: '#ffffff',
    accent: '#FD8670',
    accentContrast: '#ffffff',
    gridline: '#6e6e6e',
  },

  navigation: [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/shop' },
    { label: 'À Propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  footerLinks: [
    { label: 'Boutique', href: '/shop' },
    { label: 'Montures', href: '/#frames' },
    { label: 'Lunettes de soleil', href: '/#sunglasses' },
    { label: 'Pas pour tout le monde', href: '/#special' },
    { label: 'À propos', href: '/about' },
    { label: 'La Vie', href: '#' },
    { label: 'Le Paradoxe', href: '#' },
    { label: 'Contactez-nous', href: '/contact' },
    { label: 'Matières Premières', href: '/#materials' },
    { label: 'Échanges & Retours', href: '/retours' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Au-delà des lunettes', href: '#' },
  ],

  marqueeText: 'LIVRAISON GRATUITE SUR TOUT LE MAROC',

  heroImages: [
    {
      src: '/images/hero.png',
      alt: 'ORIVIZ hero image',
    }
  ],

  bannerImages: [
    {
      src: 'https://lohause.com/cdn/shop/files/Untitled_-_2025-10-15T173456.201.png?v=1762999292&width=3000',
      alt: 'Bannière éditoriale ORIVIZ',
    },
    {
      src: 'https://lohause.com/cdn/shop/files/Untitled_42.png?v=1730483601&width=3000',
      alt: 'Bannière artisanat ORIVIZ',
    },
    {
      src: 'https://lohause.com/cdn/shop/files/Untitled_-_2025-11-14T000641.058.png?v=1763078816&width=3000',
      alt: 'Bannière collection ORIVIZ',
    },
    {
      src: 'https://lohause.com/cdn/shop/files/Untitled_-_2025-11-13T023241.303.png?v=1763001182&width=3000',
      alt: 'Bannière campagne ORIVIZ',
    },
  ],

  products: [
    {
      id: 'aqua-halo',
      name: 'Aqua Halo',
      price: 349,
      category: 'frames',
      image: '/images/Aqua Halo.jpeg',
      imageAlt: '/images/Aqua Halo.jpeg',
      alt: 'Lunettes Aqua Halo fabriquées à la main.',
      description: 'Des lunettes de soleil au design élégant et moderne, offrant une protection UV maximale et un style audacieux pour un look unique.',
      size: '47-26-148',
      material: 'Acetate,TR,Mixed Material'
    },
    {
      id: 'eclipse',
      name: 'Eclipse',
      price: 349,
      category: 'frames',
      image: '/images/Eclipse.jpeg',
      imageAlt: '/images/Eclipse.jpeg',
      alt: 'Lunettes Eclipse fabriquées à la main.',
      description: 'Des lunettes de soleil au design audacieux, offrant une protection UV parfaite et un style moderne qui attire tous les regards.',
      size: '47-26-148',
      material: 'Acetate,TR,Mixed Material'
    },
    {
      id: 'golden-hour',
      name: 'Golden Hour',
      price: 349,
      category: 'frames',
      image: '/images/Golden Hour.jpeg',
      imageAlt: '/images/Golden Hour.jpeg',
      alt: 'Lunettes Golden Hour fabriquées à la main.',
      description: 'Des lunettes de soleil élégantes et raffinées, inspirées par la lumière dorée du coucher de soleil, pour un style unique et intemporel.',
      size: '48-24-145',
      material: 'Acetate'
    },
    {
      id: 'midnight-muse',
      name: 'Midnight Muse',
      price: 349,
      category: 'frames',
      image: '/images/Midnight Muse.jpeg',
      imageAlt: '/images/Midnight Muse.jpeg',
      alt: 'Lunettes Midnight Muse fabriquées à la main.',
      description: 'Des lunettes de soleil élégantes et mystérieuses, parfaites pour un look raffiné et audacieux, même sous les lumières les plus intenses.',
      size: '48-21-145',
      material: 'Acetate'
    },
    {
      id: 'mirage',
      name: 'MIRAGE',
      price: 349,
      category: 'frames',
      image: '/images/MIRAGE.jpeg',
      imageAlt: '/images/MIRAGE.jpeg',
      alt: 'Lunettes MIRAGE fabriquées à la main.',
      description: 'Des lunettes de soleil élégantes et raffinées, conçues pour offrir un style unique et une protection optimale sous le soleil.',
      size: '48-24-145',
      material: 'Acetate'
    },
    {
      id: 'shady',
      name: 'Shady',
      price: 349,
      category: 'frames',
      image: '/images/Shady.PNG',
      imageAlt: '/images/Shady.PNG',
      alt: 'Lunettes Shady fabriquées à la main.',
      description: 'Des lunettes de soleil au design moderne et audacieux, parfaites pour un look tendance avec une protection solaire optimale.',
      size: '48-23-145',
      material: 'Acetate'
    },
    {
      id: 'strada',
      name: 'Strada',
      price: 430,
      category: 'frames',
      image: '/images/Strada.PNG',
      imageAlt: '/images/Strada.PNG',
      alt: 'Lunettes Strada fabriquées à la main.',
      description: 'Des lunettes de soleil au design audacieux et dynamique, parfaites pour un look moderne alliant style et performance.',
      size: '48-24-145',
      material: 'Acetate'
    },
    {
      id: 'paradox',
      name: 'Paradox',
      price: 349,
      category: 'frames',
      image: '/images/Paradox.png',
      imageAlt: '/images/Paradox.png',
      alt: 'Lunettes Paradox fabriquées à la main.',
      description: 'Des lunettes de soleil au design avant-gardiste, alliant élégance et audace pour un style hors du commun.',
      size: '48-24-145',
      outOfStock: true,
      material: 'Acetate'
    }
  ],

  materials: [
    {
      title: 'Acétate Mazzucchelli 1849',
      description: 'Cellulose d\'acétate italienne produite avec des chaînes de polymères contrôlées pour une densité supérieure, une stabilité des couleurs et une intégrité structurelle à long terme.',
    },
    {
      title: 'Armature Métallique Premium Malléable',
      description: 'High-grade armature en métal avec flexibilité calibrée, conçue pour maintenir la géométrie des branches et assurer un alignement constant sous tension répétée.',
    },
    {
      title: 'Vis d\'Ultra-Précision',
      description: 'Vis micro-usinées en acier inoxydable avec filetages à tolérance serrée conçus pour minimiser le jeu, résister au desserrage et améliorer la durabilité des charnières.',
    },
  ],

  lensesInfo: {
    title: 'Verres Correcteurs par ZEISS',
    description: 'Tous nos verres correcteurs sont façonnés exclusivement par ZEISS, leader mondial de la précision optique. Nous proposons des verres unifocaux, progressifs, de lecture et des options de filtre anti-lumière bleue.',
    cta: 'Pour commander des lunettes avec verres correcteurs, sélectionnez simplement votre monture préférée, puis configurez vos verres durant la commande.',
  },

  newsletter: {
    heading: 'Accès anticipé à nos collections. Offres exclusives et nouveautés.',
    placeholder: 'Votre adresse e-mail',
    buttonText: 'S\'abonner',
  },

  // ⚠️  Les codes sont stockés sous forme de hash SHA-256.
  // Pour valider un code, le checkout compare le hash de la saisie utilisateur.
  coupons: [
    { hash: 'c6aa39483dbf1e63ee597b3f01c70df120ed7d8b92ee1a37524c37b5eb328298', type: 'percentage', value: 10 },
    { hash: '1841e32eb964404fa9dfef17aa0754f23a9dffa35ed2244c92ae5b2cb52ba161', type: 'fixed', value: 50 },
  ],

  googleSheetsWebhookUrl: '', // Collez ici l'URL de votre Web App Google Apps Script
};
