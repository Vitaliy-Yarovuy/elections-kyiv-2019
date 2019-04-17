import './main.scss';

import '@babel/polyfill';
import 'whatwg-fetch';
import * as d3 from 'd3';
import { candidates } from './config';
import { Scatterplot } from './graph/scatterplot';
import { GraphFixedStepSlider } from './graph/fixedStep';
import { GraphFixedVotesSlider } from './graph/fixedVotes';
import { setData } from './map/map';




window.renderKyivElectionGraphs = (csvUrl) => d3.dsv(';', csvUrl)
  .then(rawData => rawData.map(row => {
    const result = {
      voters: parseInt(row.voters),
      totalVotes: parseInt(row.totalVotes),
      distance: parseFloat(row.distance)
    }

    Object.keys(candidates).forEach(candidate => {
      result[candidate] = parseInt(row[candidate]);
    });

    result.lat = parseFloat(row.lat);
    result.lon = parseFloat(row.lon);

    return result;
  })).then(results => {
    new Scatterplot('#kyiv-elections-scatterplot', results);
    new GraphFixedStepSlider('#kyiv-elections-fixed-distance-step', results);
    new GraphFixedVotesSlider('#kyiv-elections-fixed-votes-step', results);
    setData(results);
  });
