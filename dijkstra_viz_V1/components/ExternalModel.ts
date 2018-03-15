import $ = require('jquery');
import d3 = require('d3');

/* 
  ExternalState keeps track of the user-facing node-link graph representation.
  It receives events from the UI and modifies the external state accordingly.
  Modifying the external state triggers updates further in the pipeline (TODO).
  To render the screen, the UI draws using the ExternalState.
 */
class ExternalModel implements EM {
  // todo: might want a keyword modifying this
  graph: {nodes: esNode[], links: esLink[]};
  // todo: give better type
  simulation: d3.Simulation<any, undefined>;
  ui: UI;

  source?: string
  target?: string
  
  constructor(graphPath: string, ui: UI) {
    // required for callbacks
    let _this = this;
    
    this.ui = ui;

    $.getJSON(graphPath, function(graph: {nodes: esNode[], links: esLink[]}) {
      _this.graph = graph;
      console.log(_this.graph);

      _this.simulation =
        d3.forceSimulation()/* .alpha(_this.alpha) */
          .force("link", d3.forceLink().id(d => d.id).distance(d => Math.abs(d.weight) * 15)/* .distance(150) */.strength(0.5))
          .force("charge", d3.forceManyBody().strength(-100))
          .force("center", d3.forceCenter(_this.ui.width / 2, _this.ui.height / 2));

      _this.simulation
        .nodes(_this.graph.nodes)
        // todo: how to update positions?
        .on("tick", ticked);

      _this.simulation.force("link")
        .links(_this.graph.links);

      _this.ui.initUI(_this.graph);
    });

    // todo: move this outside?
    function ticked() {
      _this.ui.updatePositions();
    }
  }

  private findNode(node: esNode) {
    return this.graph.nodes.findIndex(n => n === node);
  }

  mouseoverNode(node: esNode) {
    this.graph.nodes[this.findNode(node)].radius *= 1.1;
    this.ui.updateSizes(this.graph);
  }

  mouseoutNode(node: esNode) {
    this.graph.nodes[this.findNode(node)].radius /= 1.1;
    this.ui.updateSizes(this.graph);
  }

  // todo: I'm still not a fan of this ui
  mousedownNode(node: esNode) {
    this.graph.nodes[this.findNode(node)].outline = 'none';
    // select source
    if (!this.source) {
      this.source = node.id;
      this.graph.nodes[this.findNode(node)].outline = 'source';
      this.ui.updateOutlines(this.graph);
    // select target and run Dijkstra
    } else if (!this.target) {
      this.target = node.id;
      this.graph.nodes[this.findNode(node)].outline = 'target';
      this.ui.updateOutlines(this.graph);
      console.log('run Dijkstra');
    // reset
    } else {
      this.source = null;
      this.target = null;
      this.graph.nodes = this.graph.nodes.map(n => ({...n, outline: 'none'}));
      this.ui.updateOutlines(this.graph);
    }
  }

  mouseupNode(node: esNode) {
    // not sure we need to do anything here
  }
}

export = ExternalModel;
