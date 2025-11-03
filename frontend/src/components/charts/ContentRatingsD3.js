import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { analyticsAPI } from '../../services/api';

export default function ContentRatingsD3() {
  const [data, setData] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    analyticsAPI.getContentAgg().then(res => setData((res.data || []).slice(0, 20)));
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 700;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 80, left: 60 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.title))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 5])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g').call(d3.axisLeft(y));

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.title))
      .attr('y', d => y(d.avg_rating))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.avg_rating))
      .attr('fill', '#2563eb');

    g.append('text')
      .attr('x', -margin.left + 10)
      .attr('y', -8)
      .attr('fill', '#111827')
      .attr('font-size', 14)
      .attr('font-weight', '600')
      .text('Average Rating');
  }, [data]);

  return <div ref={ref} />;
}


