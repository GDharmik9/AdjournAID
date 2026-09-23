/**
 * Centralized Typography Scale Definition for AdjournAI
 * Provides accessible, high-legibility font scaling tokens
 * across both the contract text pane and the CLAIM analysis column.
 */

export const FONT_SCALES = {
  sm: {
    container: 'text-xs',
    leftPane: 'text-[13px] leading-6',
    cardTitle: 'text-xs font-bold tracking-tight',
    sectionTitle: 'text-xs font-bold',
    cardBody: 'text-xs leading-relaxed',
    cardSub: 'text-[11px] leading-relaxed',
    cardTag: 'text-[10px]',
    badge: 'text-[10px]',
    btn: 'text-[11px]',
    metricVal: 'text-base font-bold',
    detail: 'text-[11px] leading-relaxed',
  },
  md: {
    container: 'text-sm',
    leftPane: 'text-[15px] leading-7',
    cardTitle: 'text-[15px] font-bold tracking-tight',
    sectionTitle: 'text-xs font-bold',
    cardBody: 'text-sm leading-relaxed',
    cardSub: 'text-[13px] leading-relaxed',
    cardTag: 'text-xs',
    badge: 'text-[11px]',
    btn: 'text-xs',
    metricVal: 'text-xl font-bold',
    detail: 'text-[13px] leading-relaxed',
  },
  lg: {
    container: 'text-base',
    leftPane: 'text-lg leading-8',
    cardTitle: 'text-lg font-bold tracking-tight',
    sectionTitle: 'text-sm font-bold',
    cardBody: 'text-base leading-relaxed',
    cardSub: 'text-[15px] leading-relaxed',
    cardTag: 'text-[13px]',
    badge: 'text-xs',
    btn: 'text-sm',
    metricVal: 'text-2xl font-bold',
    detail: 'text-[15px] leading-relaxed',
  },
};

export const getTypography = (level = 'md') => {
  return FONT_SCALES[level] || FONT_SCALES.md;
};
