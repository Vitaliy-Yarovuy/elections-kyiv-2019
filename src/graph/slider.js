import { graph } from '../config';
import * as d3 from 'd3';
import { sliderHorizontal } from 'd3-simple-slider';

export class GraphSlider {
  constructor(selector, config){
    this.slider = sliderHorizontal()
      .min(config.min)
      .max(config.max)
      .step(config.step)
      .width(graph.width)
      .displayValue(true)
      .on('onchange', config.onChange);

    const svg = d3.select(selector)
      .append('svg')
      .attr('width', graph.width + graph.margin.left + graph.margin.right)
      .attr('height', 80)
      .append('g')
      .attr('transform', 'translate(' + graph.margin.left + ',30)');

      svg.append('text')
      .attr('text-anchor', 'start')  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr('transform', 'translate(-10, -15)')  // text is drawn off the screen top left, move down and out and rotate
      .text(config.label);

    svg.call(this.slider);


     

      

    //bug in slider
    setTimeout(() => {
      this.slider.value(config.value);
    }, 500);
  }
}