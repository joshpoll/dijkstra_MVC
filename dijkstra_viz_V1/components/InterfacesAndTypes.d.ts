declare type TODO = any;

/* UI State */
// todo: these types carry little semantic value
declare type circles = any;
declare type circleLabels = any;
declare type arrows = any;
declare type arrowLabels = any;

declare type UIState = { circles: circles, circleLabels: circleLabels, arrows: arrows, arrowLabels: arrowLabels };

/* node link model */
declare type node = { id: string, label: string, x: number, y: number, radius: number, fill: string, outline: string };
declare type link = { source: string, target: string, weight: number, type: string };

/* External Model State */
declare type esGraph = {nodes: node[], links: link[]};

declare type ExternalState = { graph: esGraph, source?: string, target?: string };

/* Internal Model State */
/* declare type isNode = TODO;
declare type isLink = {from: isNode, to: isNode, weight: number}; */
// declare type isGraph = Map<isNode, isLink[]>;
declare type isGraph = Map<node, link[]>;

declare type InternalState = { graph: isGraph, source?: string, target?: string };

/* UI Interface */
declare interface UI {
  svg: any;
  width: number;
  height: number;

  us: UIState;

  // todo: should this be a batch update or just send small changes?
  // currently batch. seems likely to stay that way
  initUI(es: ExternalState): void;
  // might just want to consolidate all of these into a single mega-method, perhaps still calling the component methods
  // todo: simulation is doing some spooky in-place manipulation
  /* updatePositions(es: ExternalState): void;
  // this could do with a small version, however d3 doesn't seem to like small updates. harder to reason about batch though
  updateSizes(es: ExternalState): void;
  updateOutlines(es: ExternalState): void; */
  updateUI(es: ExternalState): void;
}

/* ExternalModel Interface */
declare interface EM {
  // todo: this should probably be small changes
  mouseoverNode(node: node): void;
  mouseoutNode(node: node): void;
  mousedownNode(node: node): void;
  mouseupNode(node: node): void;
  initEM(is: InternalState): void;
  updateEM(is: InternalState): void;
  // updateES(): void;
}

/* InternalModel Interface */
declare interface IM {
  // todo
  setSource(node: node): void;
  setTarget(node: node): void;
  clearSourceAndTarget(): void;
}