import * as d3 from 'd3';

export function initZoom(
  svg: d3.Selection<SVGElement, unknown, null, undefined>,
) {
  const handleZoom = (e: { transform: number }) => {
    svg.selectAll('g.nodes').attr('transform', e.transform);
    svg.selectAll('g.links').attr('transform', e.transform);
  };

  svg
    .call(d3.zoom().on('zoom', handleZoom) as unknown as CallTypeSvg)
    .on('dblclick.zoom', null);
}

type CallTypeSvg = (
  selection: d3.Selection<SVGElement, unknown, null, undefined>,
) => void;
