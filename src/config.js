

// Set the dimensions of the canvas / graph
const margin = { top: 30, right: 50, bottom: 30, left: 50 },
  width = 600 - margin.left - margin.right,
  height = 270 - margin.top - margin.bottom;

export const csvUrl = './data/results_2019_kyiv.csv';
  
export const graph = {
  margin,
  width,
  height
}


export const candidates = {
  Poroshenko: {
    color: 'red'
  },
  Zelenskiy: {
    color: 'green'
  },
  Tymoshenko: {
    color: 'blue'
  }
}