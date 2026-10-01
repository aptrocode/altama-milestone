import type { WallLocale } from '../../shared/wall';

export const WALL_COPY = {
  'id': {
    hold: 'TAHAN',
    back: 'Kembali',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    photo: 'FOTO',
    language: 'Bahasa',
    languages: { 'id': 'Bahasa Indonesia', 'en': 'Bahasa Inggris', 'zh-Hans': 'Bahasa Mandarin Sederhana' },
  },
  'en': {
    hold: 'HOLD',
    back: 'Back',
    previous: 'Previous',
    next: 'Next',
    photo: 'PHOTO',
    language: 'Language',
    languages: { 'id': 'Indonesian', 'en': 'English', 'zh-Hans': 'Simplified Chinese' },
  },
  'zh-Hans': {
    hold: '长按',
    back: '返回',
    previous: '上一张',
    next: '下一张',
    photo: '图片',
    language: '语言',
    languages: { 'id': '印度尼西亚语', 'en': '英语', 'zh-Hans': '简体中文' },
  },
} satisfies Record<WallLocale, {
  hold: string;
  back: string;
  previous: string;
  next: string;
  photo: string;
  language: string;
  languages: Record<WallLocale, string>;
}>;

export const FLAG_SOURCES: Record<WallLocale, string> = {
  'id': '/flags/indonesia.svg',
  'en': '/flags/english.svg',
  'zh-Hans': '/flags/china.svg',
};
