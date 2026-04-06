import { ApiProperty } from '@nestjs/swagger';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export class ChatRequest {
  @ApiProperty({ description: 'O comando do prompt de texto (ex: Mostre um gráfico das últimas vendas)' })
  prompt: string;
  
  @ApiProperty({ required: false, description: 'Contexto opcional a ser engatado na geração' })
  context?: string;
}

export interface ChatResponse {
  message: string;
  schema?: unknown;
}

export interface MockScenario {
  id: string;
  label: string;
  keywords: string[];
  schema: UISchema;
}

/** Named accent colors the user can choose */
export type AccentColor =
  | 'indigo'
  | 'blue'
  | 'violet'
  | 'rose'
  | 'orange'
  | 'emerald'
  | 'cyan'
  | 'amber';

/** How multi-series/KPI/gauge colors are generated */
export type ColorMode =
  | 'solid'
  | 'colorful'
  | 'monochrome';

export interface ThemePreferences {
  accent: AccentColor;
  colorMode: ColorMode;
  darkMode: boolean;
}

export interface AccentTokens {
  primary: string;
  soft: string;
  dark: string;
  bgSoft: string;
  textPrimary: string;
  borderSoft: string;
  ring: string;
  chartPalette: string[];
}

export const ACCENT_TOKENS: Record<AccentColor, AccentTokens> = {
  indigo: {
    primary: '#6366f1', soft: '#eef2ff', dark: '#4338ca',
    bgSoft: 'bg-indigo-50', textPrimary: 'text-indigo-600',
    borderSoft: 'border-indigo-100', ring: 'ring-indigo-100',
    chartPalette: ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#818cf8','#4f46e5','#3730a3'],
  },
  blue: {
    primary: '#3b82f6', soft: '#eff6ff', dark: '#1d4ed8',
    bgSoft: 'bg-blue-50', textPrimary: 'text-blue-600',
    borderSoft: 'border-blue-100', ring: 'ring-blue-100',
    chartPalette: ['#3b82f6','#0ea5e9','#38bdf8','#7dd3fc','#60a5fa','#2563eb','#1d4ed8'],
  },
  violet: {
    primary: '#7c3aed', soft: '#f5f3ff', dark: '#5b21b6',
    bgSoft: 'bg-violet-50', textPrimary: 'text-violet-600',
    borderSoft: 'border-violet-100', ring: 'ring-violet-100',
    chartPalette: ['#7c3aed','#8b5cf6','#a78bfa','#6d28d9','#4c1d95','#c4b5fd','#ddd6fe'],
  },
  rose: {
    primary: '#f43f5e', soft: '#fff1f2', dark: '#be123c',
    bgSoft: 'bg-rose-50', textPrimary: 'text-rose-600',
    borderSoft: 'border-rose-100', ring: 'ring-rose-100',
    chartPalette: ['#f43f5e','#fb7185','#fda4af','#e11d48','#be123c','#fecdd3','#ff6b8a'],
  },
  orange: {
    primary: '#f97316', soft: '#fff7ed', dark: '#c2410c',
    bgSoft: 'bg-orange-50', textPrimary: 'text-orange-600',
    borderSoft: 'border-orange-100', ring: 'ring-orange-100',
    chartPalette: ['#f97316','#fb923c','#fdba74','#ea580c','#c2410c','#fed7aa','#ff9d5c'],
  },
  emerald: {
    primary: '#10b981', soft: '#ecfdf5', dark: '#047857',
    bgSoft: 'bg-emerald-50', textPrimary: 'text-emerald-600',
    borderSoft: 'border-emerald-100', ring: 'ring-emerald-100',
    chartPalette: ['#10b981','#34d399','#6ee7b7','#059669','#047857','#a7f3d0','#2dd4bf'],
  },
  cyan: {
    primary: '#06b6d4', soft: '#ecfeff', dark: '#0e7490',
    bgSoft: 'bg-cyan-50', textPrimary: 'text-cyan-600',
    borderSoft: 'border-cyan-100', ring: 'ring-cyan-100',
    chartPalette: ['#06b6d4','#22d3ee','#67e8f9','#0891b2','#0e7490','#a5f3fc','#38bdf8'],
  },
  amber: {
    primary: '#f59e0b', soft: '#fffbeb', dark: '#b45309',
    bgSoft: 'bg-amber-50', textPrimary: 'text-amber-600',
    borderSoft: 'border-amber-100', ring: 'ring-amber-100',
    chartPalette: ['#f59e0b','#fbbf24','#fcd34d','#d97706','#b45309','#fde68a','#f97316'],
  },
};

export const COLORFUL_PALETTE = [
  '#6366f1','#f43f5e','#10b981','#f59e0b','#3b82f6','#a855f7','#06b6d4',
];

export const DEFAULT_THEME: ThemePreferences = {
  accent: 'indigo',
  colorMode: 'colorful',
  darkMode: false,
};

export type ComponentType =
  | 'card' | 'chart' | 'table' | 'button' | 'list'
  | 'form' | 'kpi' | 'stat-timeline' | 'alert' | 'progress' | 'gauge';

export type LayoutType = 'grid' | 'flex' | 'stack';
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
export type ColSpan = 1 | 2 | 3 | 4;

export interface ChartDataItem {
  label: string;
  value: number;
  value2?: number; // for dual-series
}

export interface TableComponent {
  type: 'table';
  title?: string;
  columns: string[];
  rows: Record<string, string | number>[];
  span?: ColSpan;
  striped?: boolean;
  highlight?: string; // column name to highlight
}

export interface CardComponent {
  type: 'card';
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  span?: ColSpan;
}

export interface ChartComponent {
  type: 'chart';
  title?: string;
  chartType: ChartType;
  data: ChartDataItem[];
  color?: string;
  span?: ColSpan;
  legend?: boolean;
  seriesLabels?: [string, string]; // for dual-series
}

export interface ButtonComponent {
  type: 'button';
  label: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
  span?: ColSpan;
}

export interface ListItem {
  label: string;
  value?: string | number;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
  meta?: string;
}

export interface ListComponent {
  type: 'list';
  title?: string;
  items: ListItem[];
  span?: ColSpan;
  ordered?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface FormComponent {
  type: 'form';
  title?: string;
  fields: FormField[];
  submitLabel?: string;
  span?: ColSpan;
}

export interface KpiComponent {
  type: 'kpi';
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  span?: ColSpan;
  sparkline?: number[]; // mini sparkline values
}

export interface StatTimelineItem {
  period: string;
  value: number | string;
  note?: string;
}

export interface StatTimelineComponent {
  type: 'stat-timeline';
  title?: string;
  items: StatTimelineItem[];
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  span?: ColSpan;
}

export interface AlertComponent {
  type: 'alert';
  title?: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  items?: string[];
  span?: ColSpan;
}

export interface ProgressItem {
  label: string;
  value: number; // 0-100
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

export interface ProgressComponent {
  type: 'progress';
  title?: string;
  items: ProgressItem[];
  span?: ColSpan;
}

export interface GaugeComponent {
  type: 'gauge';
  title: string;
  value: number; // 0-100
  unit?: string;
  min?: number;
  max?: number;
  thresholds?: { value: number; color: string }[];
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  span?: ColSpan;
}

export type UIComponent =
  | CardComponent
  | ChartComponent
  | TableComponent
  | ButtonComponent
  | ListComponent
  | FormComponent
  | KpiComponent
  | StatTimelineComponent
  | AlertComponent
  | ProgressComponent
  | GaugeComponent;

export interface DataSource {
  id: string;
  label: string;
  endpoint: string;
  recordCount?: number;
}

export interface UISchema {
  title: string;
  layout: LayoutType;
  components: UIComponent[];
  sources?: DataSource[]; // multi-context origins
  description?: string;
}
