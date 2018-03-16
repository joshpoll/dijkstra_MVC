import { MOUSEOVER_ZOOM } from './Customization';
import $ = require('jquery');
import d3 = require('d3');
import { isGraph_to_esGraph } from './RepresentationConversion';
import InternalModel = require('./InternalModel');

/* 
  ExternalState keeps track of the user-facing node-link graph representation.
  It receives events from the UI and modifies the external state accordingly.
  Modifying the external state triggers updates further in the pipeline (TODO).
  To render the screen, the UI draws using the ExternalState.
 */
class ExternalModel implements EM {
  // todo: might want a keyword modifying this
  es: ExternalState = {graph: undefined, source: null, target: null};
  // todo: give better type
  simulation: d3.Simulation<any, undefined>;
  ui: UI;
  im: IM;
  
  constructor(graphPath: string, ui: UI) {
    // required for callbacks
    let _this = this;
    
    this.ui = ui;

    this.im = new InternalModel('./data/double_edges.json', this);
  }

  initSimulation() {
    this.simulation =
      d3.forceSimulation()/* .alpha(_this.alpha) */
        .force("link", d3.forceLink().id(d => d.id).distance(d => Math.abs(d.weight) * 15)/* .distance(150) */.strength(0.5))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(this.ui.width / 2, this.ui.height / 2));

    this.simulation
      .nodes(this.es.graph.nodes)
      // todo: how to update positions?
      .on("tick", ticked);

    this.simulation.force("link")
      .links(this.es.graph.links);

    let _this = this;
    function ticked() {
      _this.ui.updateUI(_this.es);
    }
  }

  initEM(is: InternalState) {
    this.es.graph = isGraph_to_esGraph(is.graph);

    this.initSimulation();

    this.ui.initUI(this.es);
  }

  private findNode(node: node) {
    return this.es.graph.nodes.findIndex(n => n === node);
  }

  // transient. returns directly to UI
  // todo: maybe I should enforce that this also passes down to internal model
  // todo: maybe this shouldn't leave GraphUI at all.
  // that seems reasonable
  // now it seems like methods should just be dummies and pass through if they don't do anything fancy
  // but what method would they call if passing to IM?
  mouseoverNode(node: node) {
    // default behavior (really should pass to IM?)
    this.ui.updateUI(this.es);
  }

  mouseoutNode(node: node) {
    // default behavior (really should pass to IM?)
    this.ui.updateUI(this.es);
  }

  // todo: I'm still not a fan of this ui
  // returns directly to UI unless running Dijkstra, in which case calls Dijkstra, which will bubble up changes.
  // todo: maybe persistent state like source and target should be pushed down to internal model even though it doesn't matter whether the information is deferred or not.
  // todo: I'm leaning towards pushing down to IM since this is an actual state change and it should happen immediately. IM should always be aware of the latest version of this state. But should it always be the one figuring how to deal with it?
  mousedownNode(node: node) {
    // this.es.graph.nodes[this.findNode(node)].outline = 'none';
    // select source
    if (!this.es.source) {
      this.im.setSource(node);
      // this.es.source = node.id;
      // this.es.graph.nodes[this.findNode(node)].outline = 'source';
      // this.ui.updateUI(this.es);
    // select target and run Dijkstra
    } else if (!this.es.target) {
      this.im.setTarget(node);
      // this.es.target = node.id;
      // this.es.graph.nodes[this.findNode(node)].outline = 'target';
      // this.ui.updateUI(this.es);
      console.log('run Dijkstra');
    // reset
    } else {
      this.im.clearSourceAndTarget();
      /* this.es.source = null;
      this.es.target = null;
      this.es.graph.nodes = this.es.graph.nodes.map(n => ({...n, outline: 'none'}));
      this.ui.updateUI(this.es); */
    }
  }

  mouseupNode(node: node) {
    // not sure we need to do anything here
    this.ui.updateUI(this.es); // default behavior... for now
  }

  updateEM(is: InternalState) {
    this.es.graph = isGraph_to_esGraph(is.graph);
    this.es.source = is.source;
    this.es.target = is.target;
    this.ui.updateUI(this.es);
  }
}

export = ExternalModel;
