import '@babel/polyfill'
import * as d3 from 'd3';
import { GraphBase, calculatePercentage, percentageKey } from './base'
import { graph, candidates, csvUrl } from '../config';


export class Scatterplot extends GraphBase {

  constructor(selector, data){
    super(selector, data);
    this.update();
  }

  process() {
    this.results = this.rawData.map(row => calculatePercentage({ ...row }));
  }

  update() {
    Object.keys(candidates).forEach(candidate => {
      // Add the scatterplot
      this.svg.selectAll("dot")
        .data(this.results)
        .enter().append("circle")
        .attr("r", 1)
        .attr('fill', candidates[candidate].color)
        .attr("cx", row => this.x(row.distance))
        .attr("cy", row => this.y(row[percentageKey(candidate)]));
    });
  }
}
