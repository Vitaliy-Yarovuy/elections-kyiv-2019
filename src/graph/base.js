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


export class GraphBase {
  // Set the ranges
  x = d3.scaleLinear().range([0, graph.width]);
  y = d3.scaleLinear().range([graph.height, 0]);

  // Define the axes
  xAxis = d3.axisBottom(this.x).ticks(5);
  yAxis = d3.axisLeft(this.y).ticks(5);


  constructor(selector = 'body') {
    this.init(selector);

    this.loadData().then((data) => {
      this.rawData = data;
      this.process();
      this.scaleRange();
      this.update();
      this.addAxises();
    });
  }


  init(selector) {
    this.svg = d3.select(selector)
      .append("svg")
      .attr("width", graph.width + graph.margin.left + graph.margin.right)
      .attr("height", graph.height + graph.margin.top + graph.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + graph.margin.left + "," + graph.margin.top + ")");
  }

  async loadData() {
    return d3.dsv(';', csvUrl)
      .then(rawData => rawData.map(row => {
        const result = {
          voters: parseInt(row.voters),
          totalVotes: parseInt(row.totalVotes),
          distance: parseFloat(row.distance)
        }

        Object.keys(candidates).forEach(candidate => {
          result[candidate] = parseInt(row[candidate]);
        });

        return result;
      })
      );
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
    )]);
  }

  process() {
    throw new Error('You have to implement the process method ');
  }

  update() {
    throw new Error('You have to implement the update method ');
  }

  addAxises() {
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + graph.height + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis);
  }

}