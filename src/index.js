import '@babel/polyfill'
import * as d3 from 'd3';
import * as ss from 'simple-statistics';
import {Scatterplot} from './graph/scatterplot';
import {GraphWithFixedtStep} from './graph/fixedStep';
import {GraphWithFixedtVotes} from './graph/fixedVotes';


new Scatterplot();
new GraphWithFixedtStep();
new GraphWithFixedtVotes();