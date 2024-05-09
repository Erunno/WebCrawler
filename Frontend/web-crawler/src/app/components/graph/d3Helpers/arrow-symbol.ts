export function defineArrowMarker(
  svg: d3.Selection<SVGElement, unknown, null, undefined>
) {
  svg
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'triangle')
    .attr('refX', 6)
    .attr('refY', 6)
    .attr('markerWidth', 30)
    .attr('markerHeight', 30)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 12 6 0 12 3 6')
    .style('fill', 'black');
}

type PointNoNull = { x: number; y: number };
export type SimulationLink = { source: PointNoNull; target: PointNoNull };

export function getArrowPosition(
  d: SimulationLink,
  targetRadius: number,
  arrowPushBack = 5
) {
  const direction = {
    x: d.target.x - d.source.x,
    y: d.target.y - d.source.y,
  };

  const linkLen = Math.sqrt(
    direction.x * direction.x + direction.y * direction.y
  );

  if (linkLen == 0) return d.target;

  const pushBackVector = {
    x: (-direction.x / linkLen) * (targetRadius + arrowPushBack),
    y: (-direction.y / linkLen) * (targetRadius + arrowPushBack),
  };

  return {
    x: d.source.x + direction.x + pushBackVector.x,
    y: d.source.y + direction.y + pushBackVector.y,
  };
}
