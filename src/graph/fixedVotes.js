import '@babel/polyfill'
import * as d3 from 'd3';
import { graph, candidates } from '../config';
import { GraphBase, calculatePercentage, percentageKey } from './base';
import { GraphFixedStep } from './fixedStep';
import { GraphSlider } from './slider';
import { barFixedVotesBuilder } from './barsFixedVotes';

export class GraphFixedVotes extends GraphFixedStep {
  step = 10;

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
      .attr('opacity', 0.7)
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


export class GraphFixedVotesSlider {
  constructor(selector = 'body', data) {
    this.graph = new GraphFixedVotes(selector, data);
    this.slider = new GraphSlider(selector, {
      min: 2,
      max: 30,
      step: 1,
      value: this.graph.step,
      label: 'step: numbers of bars',
      onChange: value => {
        this.graph.setStep(value);
        this.barsUpdate(this.graph.results);
      }
    });
    this.barsUpdate = barFixedVotesBuilder(selector);
  }
} 
