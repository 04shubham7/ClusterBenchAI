import React from 'react';

export default function Tooltip({
  title,
  content,
  formula,
  position = 'top',
  children,
  width = 'w-64'
}) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white dark:border-t-[#121215] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white dark:border-b-[#121215] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white dark:border-l-[#121215] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white dark:border-r-[#121215] border-y-transparent border-l-transparent'
  };

  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div
        className={`absolute ${positionClasses[position]} ${width} p-3 rounded-lg bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 text-xs shadow-xl border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 scale-95 group-hover:scale-100 origin-center`}
      >
        {title && (
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs mb-1 tracking-tight flex items-center justify-between">
            <span>{title}</span>
          </div>
        )}
        {formula && (
          <div className="px-2 py-1 mb-1.5 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-[10.5px] text-blue-600 dark:text-blue-400 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto tabular-nums">
            {formula}
          </div>
        )}
        {content && (
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            {content}
          </div>
        )}
        <div className={`absolute border-4 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
}
