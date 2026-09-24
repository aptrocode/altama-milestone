import type { Locale, Milestone, SectionId } from '~/types/milestone';
import { sectionPresentation } from './sections';

interface TranslatedSection {
  title: string;
  subtitle: string;
  caption: string;
  valuesTitle: string;
  values: [string, string, string];
}

interface TranslatedStory {
  title: string;
  description: string;
}

// Indonesian is the catalog's source language. Only translated copy lives here.
const sectionTranslations: Record<Exclude<Locale, 'id'>, Record<SectionId, TranslatedSection>> = {
  'en': {
    left: {
      title: 'The Journey Begins',
      subtitle: 'Altama’s First Business Roots',
      caption: 'Where It All Began',
      valuesTitle: 'The Values That Shaped Us',
      values: [
        'Entrepreneurial Spirit\nCreating Opportunity',
        'Hard Work\nBuilding Trust',
        'Small Beginnings\nLasting Impact',
      ],
    },
    center: {
      title: 'Transformation\nInto a New Era',
      subtitle: 'A New Identity, Infrastructure, and Strategy',
      caption: 'Reaching New Heights',
      valuesTitle: 'Pillars of Sustainable Growth',
      values: [
        'Stronger\nInfrastructure',
        'A Growing\nTeam',
        'Integrated Strategy\nfor Sustainable\nGrowth',
      ],
    },
    right: {
      title: 'Today & the Future',
      subtitle: 'A Strong Ecosystem for a Sustainable Future',
      caption: 'Moving Forward Together',
      valuesTitle: 'Collaboration for Greater Impact',
      values: [
        'A Wider\nNetwork',
        'Innovative Solutions\nfor the Future',
        'Creating Better\nImpact Together',
      ],
    },
  },
  'zh-Hans': {
    left: {
      title: '旅程启航',
      subtitle: 'Altama 最初的事业根基',
      caption: '一切从这里开始',
      valuesTitle: '塑造我们的核心价值',
      values: [
        '创业精神\n创造机遇',
        '勤奋耕耘\n建立信任',
        '从小小起点\n创造深远影响',
      ],
    },
    center: {
      title: '转型迈向\n崭新时代',
      subtitle: '新形象、新基础设施与新战略',
      caption: '迈向更高目标',
      valuesTitle: '可持续增长的支柱',
      values: [
        '更强大的\n基础设施',
        '不断壮大的\n团队',
        '一体化战略\n推动可持续增长',
      ],
    },
    right: {
      title: '当下与未来',
      subtitle: '以强大生态系统迈向可持续未来',
      caption: '携手迈向未来',
      valuesTitle: '携手合作，创造更大影响',
      values: [
        '更加广阔的\n网络',
        '面向未来的\n创新方案',
        '携手创造\n更美好的影响',
      ],
    },
  },
};

// These opening stories follow the supplied reference and remain unapproved placeholders.
const storyTranslations: Record<Exclude<Locale, 'id'>, Record<string, TranslatedStory>> = {
  'en': {
    'left-1967': {
      title: 'The Journey Begins',
      description: 'CV. Sumber Daya Group was founded, marking the beginning of the company’s journey.\n\nFrom these early foundations grew an entrepreneurial spirit, hard work, and a long-term vision.\n\nThis year began the story that would later become PT Altama Surya Anugerah.',
    },
    'center-2007': {
      title: 'Transformation Into a New Era',
      description: 'Altama Building opened as the Head Office, and the first Altama Summit was held.\n\nThe company became PT Altama Surya Anugerah with a new identity.\n\nThe Integrated Business Strategy marked a major step toward a more connected way of working.',
    },
    'right-2026': {
      title: 'Today & the Future',
      description: 'Altama now has 400+ employees, a presence in 38 provinces, 800+ direct distribution partners, and a network of 100,000+ indirect distributors.\n\nIt is supported by 2 warehouse locations, 16 service centers, and the growing TEKIRO, RYU, and REXCO ecosystem.\n\nALTAMA SUMMIT 2026 marks a new chapter of moving further together with our partners.',
    },
  },
  'zh-Hans': {
    'left-1967': {
      title: '旅程启航',
      description: 'CV. Sumber Daya Group 成立，成为公司发展历程的起点。\n\n在最初的根基上，创业精神、勤奋耕耘和长远愿景逐渐萌芽。\n\n这一年开启了后来发展为 PT Altama Surya Anugerah 的篇章。',
    },
    'center-2007': {
      title: '转型迈向崭新时代',
      description: 'Altama Building 正式启用为总部，首届 Altama Summit 也在这一年举行。\n\n公司以全新形象转型为 PT Altama Surya Anugerah。\n\n一体化业务战略的实施，标志着迈向更紧密协作体系的重要一步。',
    },
    'right-2026': {
      title: '当下与未来',
      description: 'Altama 现有 400 多名员工，业务覆盖 38 个省份，拥有 800 多家直接分销伙伴及超过 100,000 个间接分销网点。\n\n公司拥有 2 处仓储设施、16 个服务中心，以及持续发展的 TEKIRO、RYU 和 REXCO 生态系统。\n\nALTAMA SUMMIT 2026 标志着与合作伙伴携手迈向更远未来的新篇章。',
    },
  },
};

export const interfaceCopy: Record<Locale, {
  timeline: string;
  languages: string;
  reveal: string;
  loading: string;
}> = {
  'id': { timeline: 'Pilihan tahun', languages: 'Pilih bahasa', reveal: 'Warnai ilustrasi', loading: 'Menyiapkan cerita…' },
  'en': { timeline: 'Choose a year', languages: 'Choose a language', reveal: 'Reveal illustration', loading: 'Preparing story…' },
  'zh-Hans': { timeline: '选择年份', languages: '选择语言', reveal: '展示彩色插图', loading: '正在准备故事…' },
};

export function getSectionCopy(section: SectionId, locale: Locale) {
  const base = sectionPresentation[section];
  if (locale === 'id')
    return base;

  const translated = sectionTranslations[locale][section];
  return {
    ...base,
    ...translated,
    values: base.values.map((value, index) => ({
      ...value,
      text: translated.values[index]!,
    })),
  };
}

export function getMilestoneCopy(milestone: Milestone, locale: Locale): TranslatedStory {
  if (locale === 'id')
    return { title: milestone.title, description: milestone.description };

  const translated = storyTranslations[locale][milestone.id];
  if (translated)
    return translated;

  if (milestone.contentStatus === 'approved')
    throw new Error(`Missing ${locale} translation for approved milestone ${milestone.id}`);

  const second = milestone.id === 'center-2013-b';
  if (locale === 'en') {
    return {
      title: `Altama’s Journey ${milestone.year}${second ? ' · Second Story' : ''}`,
      description: `Every step adds a new chapter to Altama’s journey.\n\nThe story for the ${milestone.year} milestone${second ? ' (part two)' : ''} is being prepared for this timeline.`,
    };
  }

  return {
    title: `Altama ${milestone.year} 年历程${second ? ' · 第二篇' : ''}`,
    description: `每一步都为 Altama 的发展历程增添新的篇章。\n\n${milestone.year} 年${second ? '的第二段' : ''}里程碑故事正在准备中。`,
  };
}
