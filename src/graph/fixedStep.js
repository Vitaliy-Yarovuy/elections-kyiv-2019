import '@babel/polyfill'
import * as d3 from 'd3';
import { graph, candidates } from '../config';
import { GraphBase, calculatePercentage, percentageKey } from './base'
import { sliderHorizontal } from 'd3-simple-slider';

export class GraphWithFixedtStep extends GraphBase {
  step = 200;

  y1 = d3.scaleLinear().range([graph.height, 0]);
  y1Axis = d3.axisRight(this.y1).ticks(5);

  lines = Object.keys(candidates).reduce((acc, candidate) => {
    acc[candidate] = d3.line()
      .x(row => this.x(row.minDistance))
      .y(row => this.y(row[percentageKey(candidate)]));
    return acc;
  }, {});

  lineVotes = d3.line()
    .x(row => this.x(row.minDistance))
    .y(row => this.y1(row.totalVotes));

  slider = sliderHorizontal()
    .min(50)
    .max(1000)
    .step(50)
    .width(graph.width)
    .displayValue(true)
    .on('onchange', val => {
      this.step = val;
      this.process();
      this.update();
    });

  constructor(selector = 'body') {
    super(selector);

    d3.select(selector)
      .append('svg')
      .attr('width', graph.width + graph.margin.left + graph.margin.right)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(' + graph.margin.left + ',30)')
      .call(this.slider);

    //bug in slider
    setTimeout(() => {
      this.slider.value(this.step);
    }, 400);
  }

  process() {
    this.results = Object.values(
      this.rawData.reduce((acc, row) => {
        const key = Math.floor(row.minDistance / this.step);
        if (!acc[key]) {
          acc[key] = {
            minDistance: (key + .5) * this.step,
          };
        }

        acc[key].voters = (acc[key].voters || 0) + row.voters;
        acc[key].totalVotes = (acc[key].totalVotes || 0) + row.totalVotes;
        Object.keys(candidates).forEach(candidate => {
          acc[key][candidate] = (acc[key][candidate] || 0) + row[candidate];
        });

        return acc;
      }, {})
    ).map(row => calculatePercentage({ ...row }));
  }


  init(selector) {
    super.init(selector);
    this.pathLines = Object.keys(candidates).reduce((acc, candidate) => {
      acc[candidate] = this.svg.append("path")
        .style("fill", "transparent")
        .style("stroke", candidates[candidate].color)
      return acc;
    }, {});

    this.pathLineVotes = this.svg.append("path")
      .style("fill", "transparent")
      .style("stroke", 'black');
  }

  update() {
    this.y1.domain([0, d3.max(this.results,
      row => row.totalVotes
    )]);
    this.svg.selectAll('.y.axis.votes').remove();
    
    this.svg
      .append("g")
      .attr("class", "y axis votes")
      .attr("transform", "translate(" + graph.width + " ,0)")
      .call(this.y1Axis);

    Object.keys(candidates).forEach(candidate => {
      this.updateLine(
        `.dot.${candidate}`,
        candidates[candidate].color,
        row => this.y(row[percentageKey(candidate)]),
        this.pathLines[candidate],
        this.lines[candidate](this.results)
      )

    });

    this.updateLine(
      `.dot.totalVotes`,
      'black',
      row => this.y1(row.totalVotes),
      this.pathLineVotes,
      this.lineVotes(this.results)
    );

  }


  updateLine(selector, color, cy, pathLine, pathD) {
    const dots = this.svg.selectAll(selector)
      .data(this.results);

    dots.enter()
      .append("circle")
      .merge(dots)
      .attr("class", selector.replace(/\./g, ' '))
      .attr("r", 2.5)
      .attr('fill', color)
      .attr("cx", row => this.x(row.minDistance))
      .attr("cy", cy)
      .attr("opacity", 0)
      .transition()
      .attr("opacity", 1)
    // .duration(700);

    dots.exit()
      .attr("opacity", 0)
      .remove();

    pathLine
      .transition()
      .attr("d", pathD);
  }


  addAxises() {
    super.addAxises();

  }
}