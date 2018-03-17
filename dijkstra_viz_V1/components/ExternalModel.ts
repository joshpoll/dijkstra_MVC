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

  // pass through/back
  ticked() {
    this.ui.updateUI(this.es);
  }

  initEM(is: InternalState) {
    this.es.graph = isGraph_to_esGraph(is.graph);

    this.ui.initUI(this.es);
  }

  private findNode(node: node) {
    return this.es.graph.nodes.findIndex(n => n.id === node.id);
  }

  mouseoverNode(node: node) {
    this.im.updateNode(node);
  }

  mouseoutNode(node: node) {
    this.im.updateNode(node);
  }

  // todo: I'm still not a fan of this ui
  mousedownNode(node: node) {
    // select source
    if (!this.es.source) {
      this.im.setSource(node);
    // select target and run Dijkstra
    } else if (!this.es.target) {
      this.im.setTarget(node);
      console.log('run Dijkstra');
    // reset
    } else {
      this.im.clearSourceAndTarget();
    }
  }

  mouseupNode(node: node) {
    this.im.updateNode(node);
  }

  updateEM(is: InternalState) {
    this.es.graph = isGraph_to_esGraph(is.graph);
    this.es.source = is.source;
    this.es.target = is.target;
    this.ui.updateUI(this.es);
  }
}

export = ExternalModel;
