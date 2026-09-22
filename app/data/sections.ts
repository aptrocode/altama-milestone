import type { SectionId } from '~/types/milestone';

export type MilestoneIconName = 'bulb' | 'chart' | 'rocket' | 'heart' | 'gear' | 'sprout' | 'team' | 'target' | 'network' | 'handshake';

interface SectionPresentation {
  title: string;
  subtitle: string;
  caption: string;
  valuesTitle: string;
  icon: MilestoneIconName;
  initialId: string;
  values: { icon: MilestoneIconName; text: string }[];
}

export const sectionPresentation: Record<SectionId, SectionPresentation> = {
  left: {
    title: 'Perjalanan Dimulai',
    subtitle: 'Akar Bisnis Pertama Altama',
    caption: 'Awal dari Semua',
    valuesTitle: 'Nilai-Nilai yang Membentuk Kami',
    icon: 'bulb',
    initialId: 'left-1967',
    values: [
      { icon: 'heart', text: 'Semangat Usaha\nMenumbuhkan\nKesempatan' },
      { icon: 'gear', text: 'Kerja Keras\nMembangun\nKepercayaan' },
      { icon: 'sprout', text: 'Fondasi Kecil\nuntuk Dampak\nBesar' },
    ],
  },
  center: {
    title: 'Transformasi\nMenuju Era Baru',
    subtitle: 'Identitas, Infrastruktur, dan Strategi Baru',
    caption: 'Melangkah Lebih Tinggi',
    valuesTitle: 'Pilar Pertumbuhan Berkelanjutan',
    icon: 'chart',
    initialId: 'center-2007',
    values: [
      { icon: 'chart', text: 'Infrastruktur\nLebih Kuat' },
      { icon: 'team', text: 'Tim yang\nBertumbuh' },
      { icon: 'target', text: 'Strategi Terintegrasi\nuntuk Pertumbuhan\nBerkelanjutan' },
    ],
  },
  right: {
    title: 'Hari Ini & Masa Depan',
    subtitle: 'Ekosistem Kuat untuk Masa Depan Berkelanjutan',
    caption: 'Bersama Menuju Masa Depan',
    valuesTitle: 'Kolaborasi untuk Dampak Lebih Besar',
    icon: 'rocket',
    initialId: 'right-2026',
    values: [
      { icon: 'network', text: 'Jaringan\nMakin Luas' },
      { icon: 'bulb', text: 'Solusi Inovatif\nuntuk Masa Depan' },
      { icon: 'handshake', text: 'Bersama\nMenciptakan Dampak\nLebih Baik' },
    ],
  },
};
