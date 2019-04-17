import * as d3 from 'd3';
import { graph, candidates, csvUrl } from '../config';

export const percentageKey = candidate => `${candidate}Percentage`;

export const calculatePercentage = row => {
  Object.keys(candidates).forEach(candidate => {
    row[percentageKey(candidate)] = 100 * row[candidate] / row.totalVotes;
  });
  row.attendance = 100 * row.totalVotes / row.voters;
  return row;
};

export const getScaleSVG = (selector, width, height) => {
  const ratio = 100 * height / width;

  return d3.select(selector)
    .append('div')
    .classed('kyiv-elections-svg-container', true)
    .style('padding-bottom', `${ratio}%`)
    .append('svg')
    .classed('kyiv-elections-svg-content', true)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${width} ${height}`);
}

export class GraphBase {
  // Set the ranges
  x = d3.scaleLinear().range([0, graph.width]);
  y = d3.scaleLinear().range([graph.height, 0]);

  // Define the axes
  xAxis = d3.axisBottom(this.x).ticks(5);
  yAxis = d3.axisLeft(this.y).ticks(5);


  constructor(selector = 'body', data) {
    this.init(selector);
    this.rawData = data;
    this.process();
    this.scaleRange();
    this.addAxises();
  }


  init(selector) {
    const width = graph.width + graph.margin.left + graph.margin.right;
    const height = graph.height + graph.margin.top + graph.margin.bottom;

    this.svg = getScaleSVG(selector, width, height)
      .append('g')
      .attr('transform',
        'translate(' + graph.margin.left + ',' + graph.margin.top + ')');
  }

  scaleRange() {
    // Scale the range of the data
    this.x.domain([0, d3.max(this.rawData, row => row.distance) + 300]);
    this.y.domain([0, d3.max(this.results,
      row => Math.max(
        ...Object.keys(candidates).map(
          candidate => row[percentageKey(candidate)]
        )
      )
    ) + 10]);
  }

  process() {
    throw new Error('You have to implement the process method ');
  }

  update() {
    throw new Error('You have to implement the update method ');
  }

  addAxises() {
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + graph.height + ')')
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);
  }

}