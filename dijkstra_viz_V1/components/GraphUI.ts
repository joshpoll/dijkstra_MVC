import { ARROW_SIZE } from './Customization';

import D3Component = require('idyll-d3-component');
import d3 = require('d3');
import ExternalModel = require('./ExternalModel');
import custom = require('./Customization');

class GraphUI extends D3Component implements UI {

  svg: any;
  width: number;
  height: number;

  em: EM;

  us: UIState;

  initialize(dom, props) {
    this.svg = d3.select(dom).append('svg');
    this.width = dom.getBoundingClientRect().width;
    this.height = this.width;

    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);

    this.us = {circles: undefined, circleLabels: undefined, arrows: undefined};

    // todo: should load the file from idyll so don't have to worry about callbacks
    // this.em = new ExternalModel('./data/star.json', this);
    this.em = new ExternalModel('./data/double_edges.json', this);
  }

  // todo: move inside initUI?
  private marker(d) {
    let noHashes = custom.ARROW_COLORS[d.type].replace('#', '');
    return 'url(#'+noHashes+')';
  }

  initUI(es: ExternalState) {
    // necessary for callbacks
    let _this = this;

    // todo: should arrowheads be part of the ui state us?
    // arrowhead
    // http://bl.ocks.org/fancellu/2c782394602a93921faff74e594d1bb1
    this.svg.append('defs').selectAll('marker')
      .data(Object.keys(custom.ARROW_COLORS).map(k => custom.ARROW_COLORS[k]))
      .enter().append('marker')
        .attr('id',d => d.replace('#', ''))
        .attr('viewBox','-0 -5 10 10')
        // adjusts translation of arrowhead along line
        // TODO: make dependent on circle radius
        /* .attr('refX',0)
        .attr('refY',0) */
        .attr('orient','auto')
        .attr('markerWidth', ARROW_SIZE)
        .attr('markerHeight', ARROW_SIZE)
        .attr('xoverflow','visible')
        // prevents arrowhead from inheriting line stroke-width
        .attr('markerUnits','userSpaceOnUse')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', d => d)
        .style('stroke','none');

    // todo: which (render) order should these appear in?
    /* add elements */
    this.us.circles =
      this.svg.append('g')
        .attr('class', 'circles')
        .selectAll('circle')
        .data(es.nodes)
        .enter().append('circle')
        .attr('r', d => +d.radius)
        .attr('cx', d => d.x * this.width)
        .attr('cy', d => d.y * this.height)
        .style('fill', d => custom.CIRCLE_FILL[d.fill])
        .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline])
        .style('stroke-width', '3px');
// todo: move this under circles
      this.us.arrows =
        this.svg.append('g')
          .attr('class', 'arrows')
          .selectAll('line')
          .data(es.links)
          .enter().append('line')
          .style('stroke', d => custom.ARROW_COLORS[d.type])
          .style('stroke-width', '4px')
          .attr('marker-end', this.marker);

      // create circle labels
      this.us.circleLabels =
        this.svg.append('g')
          .attr('class', 'circleLabels')
          .selectAll('text')
          .data(es.nodes)
          .enter().append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .style('font-family','FontAwesome')
          .style('font-size','20px')
          // prevents I-bar on mouseover
          .style('pointer-events','none')
          .text(d => d.label)
          .style('fill', 'black');

    /* add event handling. pushes actual logic to the external model */
    this.us.circles
      .on('mouseover', function(d: esNode) {
        _this.em.mouseoverNode(d);
      })
      .on('mouseout', function(d: esNode) {
        _this.em.mouseoutNode(d);
      })
      .on('mousedown', function(d: esNode) {
        _this.em.mousedownNode(d);
      })
      .on('mouseup', function(d: esNode) {
        _this.em.mouseupNode(d);
      });
  }

  updatePositions(es: ExternalState) {
    this.us.circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    
    // todo: replace with more intelligent code that accounts for arrow heads and size of circles
    let arrowPositions = (d) => {
      let deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist;

      let sourcePadding, targetPadding, doublePadding;

      // todo: this test is probably wrong
      if (es.links.some(l => l.source === d.target && l.target === d.source)) {
        // todo: make a function of the padding.
        // unfortunately, there is probably not a clean way to do this. at the very least, trig functions may be required
        sourcePadding = 1 + d.source.radius - 3;
        targetPadding = 1 + d.target.radius + ARROW_SIZE - 2;
        doublePadding = 10;
      } else {
        sourcePadding = 1 + d.source.radius; // = 1 + 20 = 21
        targetPadding = 1 + d.target.radius + ARROW_SIZE; // = 1 + 20 + 13 = 34
        doublePadding = 0;
      }
      
      return {
        x1: d.source.x
            + (sourcePadding * normX)
            + (doublePadding * normY),
        y1: d.source.y
            + (sourcePadding * normY)
            - (doublePadding * normX),
        x2: d.target.x
            - (targetPadding * normX)
            + (doublePadding * normY),
        y2: d.target.y
            - (targetPadding * normY)
            - (doublePadding * normX)
      };
    }

    this.us.arrows
      .attr('x1', d => arrowPositions(d).x1)
      .attr('y1', d => arrowPositions(d).y1)
      .attr('x2', d => arrowPositions(d).x2)
      .attr('y2', d => arrowPositions(d).y2);

    this.us.circleLabels
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  }

  // todo: make this one local OR make a local version of this
  updateSizes(es: ExternalState) {
    this.us.circles
      .data(es.nodes)
      .attr('r', d => d.radius);
  }

  updateOutlines(es: ExternalState) {
    this.us.circles
      .data(es.nodes)
      .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline]);
  }

  updateUI(es: ExternalState) {
    this.updateSizes(es);
    this.updateOutlines(es);
    this.updatePositions(es);
  }
}

export = GraphUI;
