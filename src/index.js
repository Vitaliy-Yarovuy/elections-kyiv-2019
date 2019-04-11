// import 'leaflet/dist/leaflet.css' 
import 'leaflet-range/L.Control.Range';
import 'leaflet-range/L.Control.Range.css';
import './main.css';

import '@babel/polyfill';
import 'whatwg-fetch';
import * as d3 from 'd3';
import { csvUrl, candidates } from './config';
import { Scatterplot } from './graph/scatterplot';
import { GraphFixedStepSlider } from './graph/fixedStep';
import { GraphFixedVotesSlider } from './graph/fixedVotes';
import { setData } from './map/map';



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

    result.lat = parseFloat(row.lat);
    result.lon = parseFloat(row.lon);

    return result;
  })).then(results => {
    new Scatterplot('#grafs', results);
    new GraphFixedStepSlider('#grafs', results);
    new GraphFixedVotesSlider('#grafs', results);
    setData(results);
  });

