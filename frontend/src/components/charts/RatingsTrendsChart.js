import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { analyticsAPI } from '../../services/api';

export default function RatingsTrendsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    analyticsAPI.getTrends().then(res => setData(res.data || []));
  }, []);

  const byType = {};
  data.forEach(d => {
    const t = d.type || 'unknown';
    if (!byType[t]) byType[t] = [];
    byType[t].push({ day: d.day, val: d.rating_events });
  });
  Object.keys(byType).forEach(k => byType[k].sort((a,b) => (a.day||'').localeCompare(b.day||'')));
  const days = Array.from(new Set([].concat(...Object.values(byType).map(a => a.map(x => x.day)))));

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', name: 'Rating Events' },
    series: Object.keys(byType).map(k => ({
      name: k,
      type: 'line',
      smooth: true,
      data: days.map(d => {
        const rec = byType[k].find(x => x.day === d);
        return rec ? rec.val : 0;
      })
    }))
  };

  return <ReactECharts option={option} style={{ height: 360 }} />;
}


