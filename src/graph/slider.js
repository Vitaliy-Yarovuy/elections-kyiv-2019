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

    d3.select(selector)
      .append('svg')
      .attr('width', graph.width + graph.margin.left + graph.margin.right)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(' + graph.margin.left + ',30)')
      .call(this.slider);

    //bug in slider
    setTimeout(() => {
      this.slider.value(config.value);
    }, 500);
  }
}