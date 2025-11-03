import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { vizAPI, analyticsAPI } from '../services/api';

function useD3(renderFn, deps) {
  const ref = useRef(null);
  useEffect(() => { renderFn(ref.current); return () => {}; }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

function BarChart({ data, xKey, yKey, title }) {
  const ref = useD3((container) => {
    if (!container) return; container.innerHTML = '';
    const width = container.clientWidth || 700; const height = 320;
    const m = { t: 20, r: 20, b: 80, l: 60 };
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const iw = width - m.l - m.r; const ih = height - m.t - m.b;
    const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
    const x = d3.scaleBand().domain(data.map(d => d[xKey])).range([0, iw]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yKey]) || 1]).nice().range([ih, 0]);
    g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(x)).selectAll('text').attr('transform','rotate(-45)').style('text-anchor','end');
    g.append('g').call(d3.axisLeft(y));
    g.selectAll('rect').data(data).enter().append('rect').attr('x', d=>x(d[xKey])).attr('y', d=>y(+d[yKey])).attr('width', x.bandwidth()).attr('height', d=>ih - y(+d[yKey])).attr('fill', '#2563eb');
  }, [JSON.stringify(data), xKey, yKey]);
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div ref={ref} />
    </div>
  );
}

function PieChart({ data, nameKey, valueKey, title }) {
  const ref = useD3((container) => {
    if (!container) return; container.innerHTML = '';
    const width = 360, height = 300, r = Math.min(width, height) / 2;
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)
      .append('g').attr('transform', `translate(${width/2},${height/2})`);
    const total = d3.sum(data, d => +d[valueKey]) || 1;
    const pie = d3.pie().value(d => +d[valueKey]);
    const arc = d3.arc().innerRadius(0).outerRadius(r);
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const arcs = svg.selectAll('path').data(pie(data)).enter().append('g');
    arcs.append('path').attr('d', arc).attr('fill', d => color(d.data[nameKey]));
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#111827')
      .text(d => {
        const pct = ((+d.data[valueKey] / total) * 100).toFixed(1);
        return `${d.data[nameKey]}\n${pct}%`;
      });
  }, [JSON.stringify(data), nameKey, valueKey]);
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div ref={ref} />
    </div>
  );
}

function LineChart({ data, xKey, yKey, title }) {
  const ref = useD3((container) => {
    if (!container) return; container.innerHTML='';
    const width = container.clientWidth || 700; const height = 320;
    const m = { t: 20, r: 20, b: 40, l: 50 };
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const iw = width - m.l - m.r; const ih = height - m.t - m.b;
    const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
    const sorted = data.map(d => ({ x: +d[xKey], y: +d[yKey] })).filter(d=>!isNaN(d.x) && !isNaN(d.y)).sort((a,b)=>a.x-b.x);
    const x = d3.scaleLinear().domain(d3.extent(sorted, d => d.x)).nice().range([0, iw]);
    const y = d3.scaleLinear().domain([0, d3.max(sorted, d => d.y) || 1]).nice().range([ih,0]);
    const line = d3.line().x(d=>x(d.x)).y(d=>y(d.y));
    g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')));
    g.append('g').call(d3.axisLeft(y));
    g.append('path').datum(sorted).attr('fill','none').attr('stroke','#16a34a').attr('stroke-width',2).attr('d', line);
  }, [JSON.stringify(data), xKey, yKey]);
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div ref={ref} />
    </div>
  );
}

const Visualizations = () => {
  const [moviesTop, setMoviesTop] = useState([]);
  const [moviesGenre, setMoviesGenre] = useState([]);
  const [moviesYear, setMoviesYear] = useState([]);
  const [songsArtists, setSongsArtists] = useState([]);
  const [songsGenre, setSongsGenre] = useState([]);
  const [songsCount, setSongsCount] = useState(0);
  const [booksAuthors, setBooksAuthors] = useState([]);
  const [booksGenre, setBooksGenre] = useState([]);
  const [booksYear, setBooksYear] = useState([]);
  const [avgByType, setAvgByType] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);

  useEffect(() => {
    (async () => {
      const [agg, mg, my, sa, sgc, tc, ba, bg, by, art, dist] = await Promise.all([
        analyticsAPI.getContentAgg(),
        vizAPI.genreCount('movie', 10),
        vizAPI.countByYear('movie'),
        vizAPI.topArtists(10),
        vizAPI.genreCount('song', 10),
        vizAPI.countsByType(),
        vizAPI.topAuthors(10),
        vizAPI.genreCount('book', 10),
        vizAPI.countByYear('book'),
        vizAPI.avgRatingByType(),
        vizAPI.ratingDistribution()
      ]);
      const aggMovies = (agg.data || []).filter(d => d.type === 'movie').sort((a,b)=> (b.avg_rating||0)-(a.avg_rating||0)).slice(0,10);
      setMoviesTop(aggMovies.map(d => ({ title: d.title, avg_rating: d.avg_rating })));
      setMoviesGenre(mg.data.data || []);
      setMoviesYear((my.data.data || []).map(d => ({ year: +d.year, count: +d.count })));
      setSongsArtists(sa.data.data || []);
      setSongsGenre(sgc.data.data || []);
      const totalSongs = (tc.data.data || []).find(x => x.type === 'song')?.count || 0;
      setSongsCount(totalSongs);
      setBooksAuthors(ba.data.data || []);
      setBooksGenre(bg.data.data || []);
      setBooksYear((by.data.data || []).map(d => ({ year: +d.year, count: +d.count })));
      setAvgByType(art.data.data || []);
      setRatingDist((dist.data.data || []).map(d => ({ rating: String(d.rating), count: +d.count })));
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Data Visualizations (D3.js)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded p-4">
          <BarChart data={moviesTop.map(d=>({ title: d.title, rating: d.avg_rating || 0 }))} xKey="title" yKey="rating" title="Top 10 Movies by Avg Rating" />
        </div>
        <div className="bg-white shadow rounded p-4">
          <PieChart data={moviesGenre.map(d=>({ genre: d.genre, count: d.count }))} nameKey="genre" valueKey="count" title="Movies by Genre" />
        </div>
        <div className="bg-white shadow rounded p-4">
          <LineChart data={moviesYear} xKey="year" yKey="count" title="Movies Released by Year" />
      </div>

        <div className="bg-white shadow rounded p-4">
          <BarChart data={songsArtists.map(d=>({ artist: d.artist, count: d.count }))} xKey="artist" yKey="count" title="Top Artists by Song Count" />
              </div>
        <div className="bg-white shadow rounded p-4">
          <BarChart data={songsGenre.map(d=>({ genre: d.genre, count: d.count }))} xKey="genre" yKey="count" title="Songs by Genre" />
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold mb-2">Total Songs</h3>
          <div className="text-5xl font-bold text-blue-700">{songsCount}</div>
            </div>

        <div className="bg-white shadow rounded p-4">
          <BarChart data={booksAuthors.map(d=>({ author: d.author, count: d.count }))} xKey="author" yKey="count" title="Top Authors by Book Count" />
            </div>
        <div className="bg-white shadow rounded p-4">
          <PieChart data={booksGenre.map(d=>({ genre: d.genre, count: d.count }))} nameKey="genre" valueKey="count" title="Books by Genre (Treemap alt)" />
            </div>
        <div className="bg-white shadow rounded p-4">
          <LineChart data={booksYear} xKey="year" yKey="count" title="Books Published by Year" />
            </div>

        <div className="bg-white shadow rounded p-4">
          <BarChart data={avgByType.map(d=>({ type: d.type, avg: d.avgRating }))} xKey="type" yKey="avg" title="Ratings by Content Type" />
            </div>
        <div className="bg-white shadow rounded p-4">
          <PieChart data={ratingDist} nameKey="rating" valueKey="count" title="Rating Distribution (1-5)" />
        </div>
      </div>
    </div>
  );
};

export default Visualizations;

