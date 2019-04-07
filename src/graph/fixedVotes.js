import '@babel/polyfill'
import * as d3 from 'd3';
import { graph, candidates } from '../config';
import { GraphBase, calculatePercentage, percentageKey } from './base';
import { GraphWithFixedtStep } from './fixedStep';
import { sliderHorizontal } from 'd3-simple-slider';

export class GraphWithFixedtVotes extends GraphWithFixedtStep {
  step = 10;

  initSlider(selector) {
    this.slider = sliderHorizontal()
      .min(2)
      .max(30)
      .step(1)
      .width(graph.width)
      .displayValue(true)
      .on('onchange', val => {
        this.step = val;
        this.process();
        this.update();
      });

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
    }, 500);
  }

  constructor(selector = 'body') {
    super(selector);
  }

  process() {

    const totalVotes = this.rawData.reduce((sum, row) => sum + row.totalVotes, 0);
    const votesStep = totalVotes / this.step  //totalVotes * this.step / 100;

    this.results = this.rawData.reduce((results, row, index) => {
      const rIndex = results.length - 1;
      let current = results[rIndex];

      const isNext = !current ||
        ((this.rawData.length - index) > this.rawData.length / (2 * this.step)) &&
        (current.totalVotes >= votesStep || rIndex % 2 && current.totalVotes + row.totalVotes >= votesStep);

      if (isNext) {
        results.push(current = {
          totalVotes: 0,
          minDistance: row.distance
        });
      }

      current.voters = (current.voters || 0) + row.voters;
      current.totalVotes = (current.totalVotes || 0) + row.totalVotes;
      Object.keys(candidates).forEach(candidate => {
        current[candidate] = (current[candidate] || 0) + row[candidate];
      });
      current.maxDistance = row.distance;
      return results;
    }, []).map(row => {
      row.distance = row.minDistance + (row.maxDistance - row.minDistance) / 2;
      return calculatePercentage(row);
    });

    console.log(this.rawData);
    console.log(this.results);
  }


  update() {
    super.update();
    this.updateBar();
  }

  updateBar() {
     const bars = this.svg.selectAll('rect.bar.votes')
      .data(this.results);

    bars.enter()
      .append('rect')
      .merge(bars)
      .attr('class', 'bar votes')
      .attr('fill', 'black')
      .attr('opacity', 0.5)
      .attr('width', 1)
      .attr('y', row => this.y1(row.totalVotes))
      .attr('height', row => graph.height - this.y1(row.totalVotes))
      .transition()
      .attr('x', row => this.x(row.distance));

    bars.exit()
      .transition()
      .attr('opacity', 0)
      .remove();

  }

}