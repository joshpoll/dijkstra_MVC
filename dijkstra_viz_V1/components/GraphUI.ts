import { ARROW_SIZE, MOUSEOVER_ZOOM } from './Customization';

import D3Component = require('idyll-d3-component');
import d3 = require('d3');
import ExternalModel = require('./ExternalModel');
import custom = require('./Customization');

class GraphUI extends D3Component implements UI {

  svg: any;
  width: number;
  height: number;

  em: EM;

  us: UIState = {graph: {circles: undefined, arrows: undefined}, domComponents: {circles: undefined, circleLabels: undefined, arrows: undefined, arrowLabels: undefined}};

  simulation: d3.Simulation<any,undefined>;

  initialize(dom, props) {
    this.svg = d3.select(dom).append('svg');
    this.width = dom.getBoundingClientRect().width;
    this.height = this.width;

    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);

    // todo: should load the file from idyll so don't have to worry about callbacks
    // this.em = new ExternalModel('./data/star.json', this);
    this.em = new ExternalModel('./data/double_edges.json', this);
  }

  // todo: move inside initUI?
  private marker(d) {
    let noHashes = d.fill.replace('#', '');
    return 'url(#'+noHashes+')';
  }

  initCircleLabels(es: ExternalState) {
    this.us.domComponents.circleLabels = this.svg.append('g').attr('class', 'circleLabels')
      .selectAll('text')
      .data(this.us.graph.circles, d => d.id)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-family','FontAwesome')
      .style('font-size','20px')
      // prevents I-bar on mouseover
      .style('pointer-events','none')
      .text(d => d.label)
      .style('fill', 'black');
  }

  initCircles(es: ExternalState) {
    this.us.domComponents.circles = this.svg.append('g').attr('class', 'circles')
      .selectAll('circle')
      .data(this.us.graph.circles, d => d.id)
      .enter().append('circle')
      .attr('r', d => +d.radius)
      .attr('cx', d => d.x * this.width)
      .attr('cy', d => d.y * this.height)
      .style('fill', d => custom.CIRCLE_FILL[d.fill])
      .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline])
      .style('stroke-width', '3px');
  }

  initArrowLabels(es: ExternalState) {
    this.us.domComponents.arrowLabels = this.svg.append('g').attr('class', 'arrowLabels')
      .selectAll('text')
      .data(this.us.graph.arrows, d => d.source.id + ' ' + d.target.id)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-family','FontAwesome')
      .style('font-size','20px')
      // prevents I-bar on mouseover
      .style('pointer-events','none')
      .text(d => d.weight)
      .style('fill', function(d){
        if (d.weight < 0)
          return 'maroon';
        else
          return 'black';
      });
  }

  initArrows(es: ExternalState) {
    this.us.domComponents.arrows = this.svg.append('g').attr('class', 'arrows')
      .selectAll('line')
      .data(this.us.graph.arrows, d => d.source.id + ' ' + d.target.id)
      .enter().append('line')
      .style('stroke', d => d.fill)
      .style('stroke-width', '4px')
      .attr('marker-end', this.marker);
  }

  initCircleEvents(es: ExternalState) {
    let _this = this;
    this.us.domComponents.circles
      .on('mouseover', function(d: node) {
        _this.em.mouseoverNode({...d, radius: d.radius * MOUSEOVER_ZOOM});
      })
      .on('mouseout', function(d: node) {
        _this.em.mouseoutNode({...d, radius: d.radius / MOUSEOVER_ZOOM});
      })
      .on('mousedown', function(d: node) {
        _this.em.mousedownNode(d);
      })
      .on('mouseup', function(d: node) {
        _this.em.mouseupNode(d);
      });
  }

  initArrowHeads(es: ExternalState) {
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
  }

  initSimulation() {
    this.simulation =
      d3.forceSimulation()/* .alpha(_this.alpha) */
        .force('link', d3.forceLink()/* .id(d => d.id) */.distance(d => Math.abs(d.weight) * 15)/* .distance(150) */.strength(0.5))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    this.simulation
      .nodes(this.us.graph.circles)
      .on('tick', ticked);

    this.simulation.force('link')
      .links(this.us.graph.arrows);

    let _this = this;
    function ticked() {
      _this.em.ticked();
    }
  }
  
  initGraph(es: ExternalState) {
    this.us.graph.circles = es.graph.nodes.map(n => ({...n, x: 0, y: 0, vx: 0, vy: 0}));
    this.us.graph.arrows = es.graph.links.map(l => ({...l, fill: custom.ARROW_COLORS[l.type], source: this.getCircleFromID(l.source), target: this.getCircleFromID(l.target)}));
  }

  initUI(es: ExternalState) {
    this.initGraph(es);

    // todo: should arrowheads be part of the ui state us?
    // arrowhead
    this.initArrowHeads(es);
    // todo: which (render) order should these appear in?
    /* add elements */
    this.initArrows(es);
    this.initArrowLabels(es);
    this.initCircles(es);
    this.initCircleLabels(es);

    /* add event handling. pushes actual logic to the external model */
    this.initCircleEvents(es);

    this.initSimulation();
  }

  private arrowPositions(d: arrow) {
    let source = this.getCircleFromID(d.source.id), target = this.getCircleFromID(d.target.id);
    // let source = d.source, target = d.target;

    let deltaX = target.x - source.x,
        deltaY = target.y - source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist;

    let sourcePadding, targetPadding, doublePadding;

    // todo: this test is probably wrong
    // todo: wait it seems right tho...
    if (this.us.graph.arrows.some(l => l.source === d.target && l.target === d.source)) {
      // todo: make a function of the padding.
      // unfortunately, there is probably not a clean way to do this. at the very least, trig functions may be required
      sourcePadding = 1 + source.radius - 3;
      targetPadding = 1 + target.radius + ARROW_SIZE - 2;
      doublePadding = 10;
    } else {
      sourcePadding = 1 + source.radius; // = 1 + 20 = 21
      targetPadding = 1 + target.radius + ARROW_SIZE; // = 1 + 20 + 13 = 34
      doublePadding = 0;
    }
    
    return {
      x1: source.x
          + (sourcePadding * normX)
          + (doublePadding * normY),
      y1: source.y
          + (sourcePadding * normY)
          - (doublePadding * normX),
      x2: target.x
          - (targetPadding * normX)
          + (doublePadding * normY),
      y2: target.y
          - (targetPadding * normY)
          - (doublePadding * normX)
    };
  }

  updatePositions(es: ExternalState) {
    this.us.domComponents.circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.us.domComponents.arrows
      .attr('x1', d => this.arrowPositions(d).x1)
      .attr('y1', d => this.arrowPositions(d).y1)
      .attr('x2', d => this.arrowPositions(d).x2)
      .attr('y2', d => this.arrowPositions(d).y2);

    this.us.domComponents.circleLabels
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    this.us.domComponents.arrowLabels
      .attr('x', d => d3.mean([this.arrowPositions(d).x1, this.arrowPositions(d).x2]))
      .attr('y', d => d3.mean([this.arrowPositions(d).y1, this.arrowPositions(d).y2]));
  }

  // todo: make this one local OR make a local version of this
  private updateSizes(es: ExternalState) {
    this.us.domComponents.circles
      .attr('r', d => d.radius);
  }

  private updateOutlines(es: ExternalState) {
    this.us.domComponents.circles
      .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline]);
  }

  private getCircleFromID(circleID: string) {
    return this.us.graph.circles.find(c => c.id === circleID);
  }

  private findCircle(node: node) {
    return this.us.graph.circles.findIndex(c => c.id === node.id);
  }

  private findArrow(link: link) {
    return this.us.graph.arrows.findIndex(a => a.source.id === link.source && a.target.id === link.target);
  }

  // declare type node = { id: string, label: string, radius: number, fill: string, outline: string };
  // declare type circle = { id: string, label: string, radius: number, fill: string, outline: string, x: number, y: number, vx: number, vy: number }
  updateGraph(es: ExternalState) {
    for (let node of es.graph.nodes) {
      let oldCircle = this.us.graph.circles[this.findCircle(node)];
      this.us.graph.circles[this.findCircle(node)] = {...oldCircle, label: node.label, radius: node.radius, fill: node.fill, outline: node.outline };
    }

    // declare type link = { source: string, target: string, weight: number, type: string };
    // declare type arrow = { source: string, target: string, weight: number, fill: string }
    for (let link of es.graph.links) {
      let oldArrow = this.us.graph.arrows[this.findArrow(link)];
      this.us.graph.arrows[this.findArrow(link)] = {...oldArrow, source: this.getCircleFromID(link.source), target: this.getCircleFromID(link.target), weight: link.weight, fill: custom.ARROW_COLORS[link.type]};
    }

    // rebind data
    this.us.domComponents.circles
      .data(this.us.graph.circles, d => d.id);

    this.us.domComponents.arrows
      .data(this.us.graph.arrows, d => d.source.id + '->' + d.target.id);

    this.us.domComponents.circleLabels
      .data(this.us.graph.circles, d => d.id);

    this.us.domComponents.arrowLabels
      .data(this.us.graph.arrows, d => d.source.id + '->' + d.target.id);

    /* this.simulation
      .nodes(this.us.graph.circles)

    this.simulation.force('link')
      .links(this.us.graph.arrows);

    this.simulation.restart(); */
  }

  updateUI(es: ExternalState) {
    this.updateGraph(es);
    // should probably replace these with a method for each of the four pieces of data.
    this.updateSizes(es);
    this.updateOutlines(es);
    this.updatePositions(es);
  }
}

export = GraphUI;
