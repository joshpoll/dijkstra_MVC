import $ = require('jquery');
import d3 = require('d3');
import { esGraph_to_isGraph, inputGraph_to_isGraph } from './RepresentationConversion';

class InternalModel implements IM {
  is: InternalState = {graph: undefined, source: null, target: null};
  
  em: EM;

  constructor(graphPath: string, em: EM) {
    let _this = this;
    
    this.em = em;

    $.getJSON(graphPath, function(graph: inputGraph) {
      _this.is.graph = inputGraph_to_isGraph(graph);
      _this.em.initEM(_this.is);
    });
  }

  private findNode(nodeID: string) {
    for (let k of this.is.graph.keys()) {
      if (k.id === nodeID) {
        return k;
      }
    }
    return null;
  }

  // bubbles up to EM
  updateNode(node: node) {
    let links = this.is.graph.get(this.findNode(node.id));
    this.is.graph.delete(this.findNode(node.id));
    this.is.graph.set(node, links);
    this.em.updateEM(this.is);
  }

  setSource(node: node) {
    this.is.source = node.id;
    let newNode = {...node, outline: 'source'};
    this.updateNode(newNode);
  }

  setTarget(node: node) {
    this.is.target = node.id;
    let newNode = {...node, outline: 'target'};
    this.updateNode(newNode);
  }

  // todo: alternatively, can just set every node's outline to none, but might be more work than this method.
  clearSourceAndTarget() {
    let clearSource = {...this.findNode(this.is.source), outline: 'none'};
    let clearTarget = {...this.findNode(this.is.target), outline: 'none'};
    this.is.source = null;
    this.is.target = null;
    this.updateNode(clearSource);
    this.updateNode(clearTarget);
  }
}

export = InternalModel;
