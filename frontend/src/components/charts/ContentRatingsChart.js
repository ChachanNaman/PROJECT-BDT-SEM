import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { analyticsAPI } from '../../services/api';

export default function ContentRatingsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    analyticsAPI.getContentAgg().then(res => setData(res.data || []));
  }, []);

  const titles = data.map(d => d.title).slice(0, 20);
  const avg = data.map(d => d.avg_rating).slice(0, 20);

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 30, bottom: 80 },
    xAxis: { type: 'category', data: titles, axisLabel: { rotate: 45, interval: 0 } },
    yAxis: { type: 'value', name: 'Avg Rating', min: 0, max: 5 },
    series: [{ type: 'bar', data: avg, itemStyle: { color: '#2563eb' } }]
  };

  return <ReactECharts option={option} style={{ height: 360 }} />;
}


