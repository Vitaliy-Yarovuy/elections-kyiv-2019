import '@babel/polyfill'
import * as d3 from 'd3';
import { graph, candidates } from '../config';
import { percentageKey } from './base';

const grey = '#a6a2a2'

export const barFixedVotesBuilder = (selector) => {

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', graph.width + graph.margin.left + graph.margin.right)
    .attr('height', graph.height + graph.margin.top + graph.margin.bottom + 200)
    .append('g')
    .attr('transform',
      'translate(' + graph.margin.left + ',' + graph.margin.top + ')');

  const x = d3.scaleLinear().range([0, graph.width]);
  const y = d3.scaleLinear().range([graph.height, 0]);

  const xAxis = d3.axisBottom(x).ticks(0);
  const yAxis = d3.axisLeft(y).ticks(5);

  y.domain([0, 100]);
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);


  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + graph.height + ")")
    .call(xAxis);



  return (data) => {
    const candidateKeys = Object.keys(candidates);

    const columnCount = data.length;
    const columnWidht = (graph.width / columnCount);

    const colors = candidateKeys.map(candidate => candidates[candidate].color);
    colors.push(grey);

    const stackedSeries = data.reduce((series, row) => {
      const result = candidateKeys.reduce((result, key, index) => {
        const newResult = result - row[percentageKey(key)];
        series[index].push([newResult, result]);
        return newResult;
      }, 100);
      series[candidateKeys.length].push([0, result]);
      return series;
    }, [...candidateKeys.map(_ => []), []])

    svg.selectAll('g.series').remove();

    const gSerias = svg.selectAll('g.series')
      .data(stackedSeries)
      .enter()
      .append('g')
      .classed('series', true)
      .style('fill', (row, i) => colors[i]);

    gSerias.selectAll('rect')
      .data(x => x)
      .enter()
      .append('rect')
      .attr('width', columnWidht - 1)
      .attr('x', (row, i) => i * columnWidht + 1)
      .attr('y', row => y(100 - row[0]))
      .attr('height', row => y(100 - (row[1] - row[0])));

    gSerias.selectAll('text.bar-percent')
      .data(x => x)
      .enter()
      .append('text')
      .classed('bar-percent', true)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-size', '12')
      .attr('fill', 'black')
      .attr('transform', (row, index) => `translate(${(index + 0.5) * columnWidht}, ${y(100 - row[1] + (row[1] - row[0]) / 2)}) rotate(-90)`)
      .text(row => `${Math.round((row[1] - row[0]) * 10) / 10}`);


    svg.selectAll('text.bar-title').remove();

    svg.selectAll('text.bar-title')
      .data(data)
      .enter()
      .append('text')
      .classed('bar-title', true)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('transform', (row, index) => `translate(${(index + 0.5) * columnWidht}, ${graph.height + 10}) rotate(-70)`)
      .text(row => `${Math.round(row.minDistance / 10) * 10} - ${Math.round(row.maxDistance / 10) * 10} m`)
  }
}