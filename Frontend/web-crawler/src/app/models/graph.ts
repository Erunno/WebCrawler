export interface NodeStyles {}

export interface GraphNode {
  id: number;
  url: string;
  label: string;
}

export interface GraphLink {
  source: number;
  target: number;
}
