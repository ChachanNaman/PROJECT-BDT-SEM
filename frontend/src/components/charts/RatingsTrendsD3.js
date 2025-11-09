import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { analyticsAPI } from '../../services/api';

export default function RatingsTrendsD3() {
  const [data, setData] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    analyticsAPI.getTrends().then(res => setData(res.data || []));
  }, []);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 700;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // reshape by type
    const byType = d3.group(data, d => d.type || 'unknown');
    const allDays = Array.from(new Set(data.map(d => d.day))).sort();

    const x = d3.scalePoint()
      .domain(allDays)
      .range([0, innerWidth]);

    const maxY = d3.max(data, d => d.rating_events) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY]).nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickValues(allDays.filter((_, i) => i % Math.ceil(allDays.length / 10) === 0)));
    g.append('g').call(d3.axisLeft(y));

    const line = d3.line()
      .defined(d => d.day != null)
      .x(d => x(d.day))
      .y(d => y(d.rating_events));

    const color = d3.scaleOrdinal()
      .domain(Array.from(byType.keys()))
      .range(['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6']);

    for (const [type, rows] of byType.entries()) {
      const sorted = rows.slice().sort((a, b) => (a.day || '').localeCompare(b.day || ''));
      g.append('path')
        .datum(sorted)
        .attr('fill', 'none')
        .attr('stroke', color(type))
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    // simple legend
    let lx = 0;
    let ly = -10;
    for (const type of color.domain()) {
      lx += 100;
      g.append('rect').attr('x', lx - 90).attr('y', ly).attr('width', 12).attr('height', 12).attr('fill', color(type));
      g.append('text').attr('x', lx - 72).attr('y', ly + 10).attr('font-size', 12).text(type);
    }
  }, [data]);

  return <div ref={ref} />;
}


