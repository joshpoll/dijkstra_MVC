declare type TODO = any;

/* node link model (EM, IM) */
// a mixture of style information and graph information
declare type node = { id: string, label: string, radius: number, fill: string, outline: string };
declare type link = { source: string, target: string, weight: number, type: string };

// todo: maybe this should be eliminated and node-label should be used instead
/* circle arrow model (UI) */
// much closer to the actual HTML. supports simulation
declare type circle = { id: string, label: string, radius: number, fill: string, outline: string, x: number, y: number, vx: number, vy: number }
declare type arrow = { source: circle, target: circle, weight: number, fill: string }

/* UI State */
declare type uiGraph = { circles: circle[], arrows: arrow[] };
declare type UIState = {graph: uiGraph, domComponents: {circles: any, circleLabels: any, arrows: any, arrowLabels: any}};

/* External Model State */
declare type esGraph = {nodes: node[], links: link[]};

declare type ExternalState = { graph: esGraph, source?: string, target?: string };

/* Internal Model State */
declare type isGraph = Map<node, link[]>;

declare type InternalState = { graph: isGraph, source?: string, target?: string };

declare type inputGraph = esGraph;

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
  ticked(): void;
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
  updateNode(node: node): void;
}