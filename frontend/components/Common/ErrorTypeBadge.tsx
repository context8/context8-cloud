import React from 'react';
import {
  Lightbulb,
  HelpCircle,
  Plug,
  Layout,
  Hammer,
  Settings,
  FileText,
  GitCompare,
  Scale,
  Database,
  Server,
  CircleDot,
  Zap,
  GitBranch,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { ThemeMode } from '../../types';

// Error type configuration (new types + preserved old types)
const errorTypeConfig: Record<string, {
  icon: LucideIcon;
  label: string;
  lightClasses: string;
  darkClasses: string;
}> = {
  // === NEW TYPES ===
  feature_request: {
    icon: Lightbulb,
    label: 'Feature Request',
    lightClasses: 'bg-purple-50 text-purple-700 border-purple-200',
    darkClasses: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  question_support: {
    icon: HelpCircle,
    label: 'Question/Support',
    lightClasses: 'bg-blue-50 text-blue-700 border-blue-200',
    darkClasses: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  api_integration: {
    icon: Plug,
    label: 'API/Integration',
    lightClasses: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    darkClasses: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  ui_ux: {
    icon: Layout,
    label: 'UI/UX',
    lightClasses: 'bg-pink-50 text-pink-700 border-pink-200',
    darkClasses: 'bg-pink-950 text-pink-300 border-pink-800',
  },
  build_ci: {
    icon: Hammer,
    label: 'Build/CI',
    lightClasses: 'bg-red-50 text-red-700 border-red-200',
    darkClasses: 'bg-red-950 text-red-300 border-red-800',
  },
  install_setup: {
    icon: Settings,
    label: 'Install/Setup',
    lightClasses: 'bg-orange-50 text-orange-700 border-orange-200',
    darkClasses: 'bg-orange-950 text-orange-300 border-orange-800',
  },
  docs_request: {
    icon: FileText,
    label: 'Docs Request',
    lightClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    darkClasses: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },
  compatibility: {
    icon: GitCompare,
    label: 'Compatibility',
    lightClasses: 'bg-amber-50 text-amber-700 border-amber-200',
    darkClasses: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  licensing: {
    icon: Scale,
    label: 'Licensing',
    lightClasses: 'bg-slate-100 text-slate-700 border-slate-300',
    darkClasses: 'bg-slate-800 text-slate-300 border-slate-600',
  },
  data_quality: {
    icon: Database,
    label: 'Data Quality',
    lightClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkClasses: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  ops_infra: {
    icon: Server,
    label: 'Ops/Infra',
    lightClasses: 'bg-violet-50 text-violet-700 border-violet-200',
    darkClasses: 'bg-violet-950 text-violet-300 border-violet-800',
  },
  other: {
    icon: CircleDot,
    label: 'Other',
    lightClasses: 'bg-gray-50 text-gray-700 border-gray-200',
    darkClasses: 'bg-gray-800 text-gray-300 border-gray-700',
  },

  // === PRESERVED OLD TYPES (no direct mapping to new types) ===
  'runtime error': {
    icon: Zap,
    label: 'Runtime',
    lightClasses: 'bg-orange-50 text-orange-700 border-orange-200',
    darkClasses: 'bg-orange-950 text-orange-300 border-orange-800',
  },
  'logic error': {
    icon: GitBranch,
    label: 'Logic',
    lightClasses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    darkClasses: 'bg-yellow-950 text-yellow-300 border-yellow-800',
  },
  'security issue': {
    icon: Shield,
    label: 'Security',
    lightClasses: 'bg-rose-50 text-rose-700 border-rose-200',
    darkClasses: 'bg-rose-950 text-rose-300 border-rose-800',
  },
};

// Backward compatibility: map old error type variations to canonical keys
const errorTypeAliases: Record<string, keyof typeof errorTypeConfig> = {
  // Old types that map to new types
  'compile error': 'build_ci',
  'compile': 'build_ci',
  'configuration error': 'install_setup',
  'configuration': 'install_setup',
  'config': 'install_setup',
  'dependency error': 'compatibility',
  'dependency': 'compatibility',
  'network error': 'api_integration',
  'network': 'api_integration',
  'performance issue': 'ops_infra',
  'performance': 'ops_infra',
  'perf': 'ops_infra',

  // Old types preserved (alias variations)
  'runtime': 'runtime error',
  'logic': 'logic error',
  'security': 'security issue',

  // New type variations (underscore/hyphen/space)
  'feature-request': 'feature_request',
  'feature request': 'feature_request',
  'question-support': 'question_support',
  'question support': 'question_support',
  'question': 'question_support',
  'support': 'question_support',
  'api-integration': 'api_integration',
  'api integration': 'api_integration',
  'api': 'api_integration',
  'integration': 'api_integration',
  'ui-ux': 'ui_ux',
  'ui ux': 'ui_ux',
  'ui': 'ui_ux',
  'ux': 'ui_ux',
  'build-ci': 'build_ci',
  'build ci': 'build_ci',
  'build': 'build_ci',
  'ci': 'build_ci',
  'install-setup': 'install_setup',
  'install setup': 'install_setup',
  'install': 'install_setup',
  'setup': 'install_setup',
  'docs-request': 'docs_request',
  'docs request': 'docs_request',
  'docs': 'docs_request',
  'documentation': 'docs_request',
  'data-quality': 'data_quality',
  'data quality': 'data_quality',
  'data': 'data_quality',
  'ops-infra': 'ops_infra',
  'ops infra': 'ops_infra',
  'ops': 'ops_infra',
  'infra': 'ops_infra',
  'infrastructure': 'ops_infra',
  'devops': 'ops_infra',
};

export const normalizeErrorType = (type?: string): keyof typeof errorTypeConfig => {
  if (!type) return 'other';
  const raw = type.toLowerCase().trim();
  // Direct match
  if (errorTypeConfig[raw]) {
    return raw as keyof typeof errorTypeConfig;
  }
  // Alias match
  return errorTypeAliases[raw] || 'other';
};

interface ErrorTypeBadgeProps {
  type?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  theme: ThemeMode;
}

export const ErrorTypeBadge: React.FC<ErrorTypeBadgeProps> = ({
  type,
  size = 'sm',
  showIcon = true,
  theme,
}) => {
  const normalizedType = normalizeErrorType(type);
  const config = errorTypeConfig[normalizedType] || errorTypeConfig.other;
  const Icon = config.icon;
  const isDark = theme === 'dark';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md border
        ${sizeClasses}
        ${isDark ? config.darkClasses : config.lightClasses}
      `}
    >
      {showIcon && <Icon size={iconSize} />}
      <span>{config.label}</span>
    </span>
  );
};

// Only return new types for dropdown (not legacy types)
export const getErrorTypeOptions = () => {
  const newTypes = [
    'feature_request', 'question_support', 'api_integration', 'ui_ux',
    'build_ci', 'install_setup', 'docs_request', 'compatibility',
    'licensing', 'data_quality', 'ops_infra', 'other'
  ];
  return newTypes.map(key => ({
    value: key,
    label: errorTypeConfig[key].label,
    icon: errorTypeConfig[key].icon,
  }));
};
