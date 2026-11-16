import React, { useEffect, useRef } from 'react';

export default function PlotlyChart({ data, layout, config, style, isDark = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !window.Plotly) return;

    const gridColor = isDark ? 'rgba(39, 39, 42, 0.6)' : 'rgba(226, 232, 240, 0.9)';
    const textColor = isDark ? '#A1A1AA' : '#1E293B';
    const tickColor = isDark ? '#71717A' : '#64748B';

    const mergedLayout = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, -apple-system, sans-serif',
        color: textColor,
        size: 11
      },
      hoverlabel: {
        bgcolor: isDark ? '#121215' : '#FFFFFF',
        bordercolor: isDark ? '#27272A' : '#CBD5E1',
        font: {
          family: 'JetBrains Mono, Inter, sans-serif',
          size: 11,
          color: isDark ? '#F4F4F5' : '#0F172A'
        }
      },
      margin: { l: 45, r: 25, t: 30, b: 40 },
      ...layout,
      xaxis: {
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: tickColor },
        ...layout?.xaxis
      },
      yaxis: {
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: tickColor },
        ...layout?.yaxis
      }
    };

    const baseConfig = {
      responsive: true,
      displayModeBar: 'hover',
      displaylogo: false,
      modeBarButtonsToRemove: [
        'sendDataToCloud',
        'hoverClosestCartesian',
        'hoverCompareCartesian',
        'lasso2d',
        'select2d',
        'toggleSpikelines',
        'autoScale2d'
      ],
      ...config
    };

    window.Plotly.react(containerRef.current, data, mergedLayout, baseConfig);

    const handleResize = () => {
      if (containerRef.current && window.Plotly) {
        window.Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config, isDark]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '300px', ...style }}
    />
  );
}
