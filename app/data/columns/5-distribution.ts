import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

/** Column 5 — Distribusi & Pemasaran. Idle tiles open Distribusi or Pemasaran directly. */
export const DISTRIBUTION: ColumnConfig = {
  id: 5,
  key: 'distribution',
  type: 'expandable',
  icon: 'pin',
  illustration: provisional('/illustrations/distribution.webm'),
  captionTiles: true,
  defaultSub: 'distribusi',
  i18n: {
    'id': { label: 'DISTRIBUSI & PEMASARAN' },
    'en': { label: 'DISTRIBUTION & MARKETING' },
    'zh-Hans': { label: '分销与营销' },
  },
  subItems: [
    {
      key: 'distribusi',
      image: provisional('/illustrations/distribution/distribusi.webp'),
      i18n: { 'id': { label: 'DISTRIBUSI' }, 'en': { label: 'DISTRIBUTION' }, 'zh-Hans': { label: '分销' } },
      pages: [
        onlyPage([provisional('/photos/distribution/distribusi/photo-1.webp'), PHOTO_PLACEHOLDER], {
          'id': [{ bullets: [
            { lead: 'Marketplace' },
            { lead: 'Modern Market' },
            { lead: 'Jangkauan Indonesia', text: 'Hadir di 38 provinsi lewat 800+ mitra distribusi langsung dan 100.000+ jaringan distribusi tidak langsung' },
            { lead: 'Jangkauan internasional', text: 'Pendistribusian hingga mancanegara.' },
          ] }],
          'en': [{ bullets: [
            { lead: 'Marketplace' },
            { lead: 'Modern Market' },
            { lead: 'Indonesian reach', text: 'Present in 38 provinces through 800+ direct distribution partners and 100,000+ indirect distribution outlets' },
            { lead: 'International reach', text: 'Distribution to overseas markets.' },
          ] }],
          'zh-Hans': [{ bullets: [
            { lead: '电商平台' },
            { lead: '现代零售渠道' },
            { lead: '印尼覆盖', text: '通过 800 多家直接分销伙伴和 100,000 多个间接分销网点覆盖 38 个省份' },
            { lead: '国际覆盖', text: '分销至海外市场。' },
          ] }],
        }),
      ],
    },
    {
      key: 'pemasaran',
      image: provisional('/illustrations/distribution/pemasaran.webp'),
      i18n: { 'id': { label: 'PEMASARAN' }, 'en': { label: 'MARKETING' }, 'zh-Hans': { label: '营销' } },
      pages: [
        onlyPage([PHOTO_PLACEHOLDER, PHOTO_PLACEHOLDER], {
          'id': ['Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.'],
          'en': ['Integrated brand activations through national automotive expos, mechanic workshops, educational roadshows, and industrial communities.'],
          'zh-Hans': ['通过国家级汽车展会、机械维修工坊、教育巡展以及行业社群进行一体化品牌推广。'],
        }),
      ],
    },
  ],
};
