export interface GraphNode {
  id: string;
  url: string;
  label: string;
}

export interface GraphLink {
  source: string;
  target: string;
}
