
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class D3TypeScriptTest extends D3Component {

  initialize(node, props) {
    var svg = d3.select(node).append('svg');
    var width = node.getBoundingClientRect().width;
    var height = width;

    svg.attr('width', width);
    svg.attr('height', height);

    svg
    .append("circle")
    .attr("r", 5)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", "red");
  }
}

module.exports = D3TypeScriptTest;
