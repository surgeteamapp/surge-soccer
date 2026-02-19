"use client";

import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color = 'blue',
  size = 'md',
}: StatCardProps) {
  // Determine color classes
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    gray: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  };
  
  // Determine size classes
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  
  // Determine trend classes and icon
  const getTrendClasses = () => {
    if (!trend) return 'text-gray-500 dark:text-gray-400';
    return trend > 0
      ? 'text-green-600 dark:text-green-400'
      : trend < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-500 dark:text-gray-400';
  };
  
  const getTrendIcon = () => {
    if (!trend) return <MinusIcon className="h-3 w-3" />;
    return trend > 0 ? (
      <ArrowUpIcon className="h-3 w-3" />
    ) : (
      <ArrowDownIcon className="h-3 w-3" />
    );
  };
  
  return (
    <div className={`rounded-lg shadow-sm ${colorClasses[color]} ${sizeClasses[size]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">
            {title}
          </p>
          <div className={`mt-1 ${size === 'lg' ? 'text-3xl' : 'text-2xl'} font-bold`}>
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs opacity-70">{subtitle}</p>
          )}
          {(trend !== undefined || trendLabel) && (
            <div className={`mt-2 flex items-center text-xs ${getTrendClasses()}`}>
              {trend !== undefined && (
                <span className="flex items-center mr-1">
                  {getTrendIcon()}
                  <span className="ml-1">{Math.abs(trend)}%</span>
                </span>
              )}
              {trendLabel && <span>{trendLabel}</span>}
            </div>
          )}
        </div>
        
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
    </div>
  );
}
