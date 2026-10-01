/* ============================================
   ALTAMA Interactive Wall — Configuration
   ============================================
   Data-driven config: ubah di sini untuk
   menambah/mengurangi kolom, sub-menu, dll.
   ============================================ */

const WALL_CONFIG = {
  columns: [
    {
      id: 1,
      key: 'about-altama',
      label: 'ABOUT ALTAMA',
      labelHtml: 'ABOUT<br/>ALTAMA',
      type: 'single',           // 'single' = no submenu
      headerTitle: 'ABOUT ALTAMA',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'ABOUT ALTAMA',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
    {
      id: 2,
      key: 'our-brands',
      label: 'OUR BRANDS',
      labelHtml: 'OUR<br/>BRANDS',
      type: 'expandable',       // 'expandable' = has sub-menu
      parentLabel: 'OUR BRANDS',
      subItems: [
        { key: 'tekiro', label: 'TEKIRO' },
        { key: 'ryu', label: 'RYU' },
        { key: 'rexco', label: 'REXCO' },
      ],
      // Default active sub (for header/footer when open)
      defaultSub: 'tekiro',
      headerTitle: 'TEKIRO',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'TEKIRO',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
    {
      id: 3,
      key: 'infrastructure',
      label: 'INFRASTRUCTURE',
      labelHtml: 'INFRA-<br/>STRUCTURE',
      type: 'single',
      headerTitle: 'INFRASTRUCTURE',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'INFRASTRUCTURE',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
    {
      id: 4,
      key: 'digital-partners',
      label: 'DIGITAL PARTNERS',
      labelHtml: 'DIGITAL<br/>PARTNERS',
      type: 'single',
      headerTitle: 'DIGITAL PARTNERS',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'DIGITAL PARTNERS',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
    {
      id: 5,
      key: 'distribution',
      label: 'DISTRIBUTION',
      labelHtml: 'DISTRI-<br/>BUTION',
      type: 'expandable',
      parentLabel: 'DISTRIBUTION',
      subItems: [
        { key: 'our-way', label: 'OUR WAY FOR DISTRIBUTION', labelHtml: 'OUR WAY FOR<br/>DISTRIBUTION' },
        { key: 'brand-activation', label: 'BRAND ACTIVATION', labelHtml: 'BRAND<br/>ACTIVATION' },
      ],
      defaultSub: 'brand-activation',
      headerTitle: 'BRAND ACTIVATION',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'BRAND ACTIVATION',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
    {
      id: 6,
      key: 'summit-2026',
      label: 'SUMMIT 2026',
      labelHtml: 'SUMMIT<br/>2026',
      type: 'single',
      headerTitle: 'SUMMIT 2026',
      headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      bottomTitle: 'SUMMIT 2026',
      bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      slides: 3,
    },
  ],

  // Content data per sub-item (title shown in header when sub-item is active)
  subItemContent: {
    'tekiro': {
      title: 'TEKIRO',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    'ryu': {
      title: 'RYU',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    },
    'rexco': {
      title: 'REXCO',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    },
    'our-way': {
      title: 'OUR WAY FOR DISTRIBUTION',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    },
    'brand-activation': {
      title: 'BRAND ACTIVATION',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },
};
