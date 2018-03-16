export function esGraph_to_isGraph(esGraph: esGraph): isGraph {
  let isGraph = new Map<node, link[]>();

  for (var n of esGraph.nodes) {
    isGraph.set(n, esGraph.links.filter(l => l.source === n.id));
  }

  return isGraph;
}

export function isGraph_to_esGraph(isGraph: isGraph): esGraph {
  let esGraph = {nodes: undefined, links: undefined};

  esGraph.nodes = [ ...isGraph.keys() ]; // coerces key iterator to list
  esGraph.links = [].concat(...isGraph.values()); // coerces and flattens

  return esGraph;
}
