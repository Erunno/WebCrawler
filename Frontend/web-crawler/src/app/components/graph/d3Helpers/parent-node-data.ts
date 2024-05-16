import * as d3 from 'd3';
import { GraphNode } from 'src/app/models/graph';

type TypeOfThisFromD3CallbackFunction = unknown;

function getParentNodeDatum(
  element: TypeOfThisFromD3CallbackFunction,
): GraphNode {
  return d3
    .select((element as { parentNode: SVGAElement }).parentNode)
    .datum() as GraphNode;
}

export function accessParentDatum<TReturn>(
  callback: (node: GraphNode) => TReturn,
) {
  // Where to even start... D3 uses binding of `this`, which is why I had to
  // disable TypeScript checks to deal with `this`.

  // Anyway, the purpose of this function is to access the datum of the parent
  // element. D3 binds the updated data to top-level elements (`g`), however, in
  // children (`circle` and `text`), the data remains old. Therefore, I need the data
  // from `g` when dealing with selections of `circle` or `text`.

  return function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const parentDatum = getParentNodeDatum(this);
    return callback(parentDatum);
  };
}
