import { graph } from '../config';
import * as d3 from 'd3';
import { getScaleSVG } from './base';
import { sliderHorizontal } from 'd3-simple-slider';

export class GraphSlider {
  constructor(selector, config) {

    const width = graph.width + graph.margin.left + graph.margin.right;
    const height = 80;

    this.slider = sliderHorizontal()
      .min(config.min)
      .max(config.max)
      .step(config.step)
      .width(graph.width)
      .displayValue(true)
      .on('onchange', config.onChange);

    const svg = getScaleSVG(selector, width, height)
      .append('g')
      .attr('transform', 'translate(' + graph.margin.left + ',30)');

    svg.append('text')
      .attr('text-anchor', 'start')
      .attr('transform', 'translate(-10, -15)')
      .text(config.label);

    svg.call(this.slider);






    //bug in slider
    setTimeout(() => {
      this.slider.value(config.value);
    }, 500);
  }
}