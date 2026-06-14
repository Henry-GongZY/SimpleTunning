import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { usePipelineStore } from '../../stores/pipelineStore';

export function StatsPanel() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { nodeTimings } = usePipelineStore();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const nodes = Object.keys(nodeTimings);
    const times = Object.values(nodeTimings);

    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: nodes.length ? nodes : ['N/A'],
        axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: 'ms',
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          data: times.length ? times : [0],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: '#7c3aed' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    });

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [nodeTimings]);

  return (
    <div className="bg-surface rounded-lg overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-gray-700">
        <span className="text-xs text-gray-400">Performance Stats</span>
      </div>
      <div ref={chartRef} className="flex-1" style={{ minHeight: 200 }} />
    </div>
  );
}
