import '@babel/polyfill'
import * as d3 from 'd3';
import { csvUrl, candidates } from './config';
import { Scatterplot } from './graph/scatterplot';
import { GraphFixedStepSlider } from './graph/fixedStep';
import { GraphFixedVotesSlider } from './graph/fixedVotes';




d3.dsv(';', csvUrl)
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
  })).then(results => {
    new Scatterplot('body', results);
    new GraphFixedStepSlider('body', results);
    new GraphFixedVotesSlider('body', results);
  });

