/* UI State */
// todo: these types carry little semantic value
declare type circles = any
declare type circleLabels = any;
declare type arrows = any;

declare type UIState = { circles: circles, circleLabels: circleLabels, arrows: arrows };

/* External Model State */
declare type esNode = { id: string, label: string, x: number, y: number, radius: number, fill: string, outline: string };
declare type esLink = { source: string, target: string, weight: number, type: string };

declare type ExternalState = { nodes: esNode[], links: esLink[] };

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
  updatePositions(): void;
  // this could do with a small version, however d3 doesn't seem to like small updates. harder to reason about batch though
  updateSizes(es: ExternalState): void;
  updateOutlines(es: ExternalState): void;
  // updateUI(es: ExternalState): void;
}

/* ExternalModel Interface */
declare interface EM {
  // todo: this should probably be small changes
  mouseoverNode(node: esNode): void;
  mouseoutNode(node: esNode): void;
  mousedownNode(node: esNode): void;
  mouseupNode(node: esNode): void;
  // updateES(): void;
}
