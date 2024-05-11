export interface GraphNode {
  id: number;
  style: NodeStyles;
  data: NodeData;
}

export interface GraphLink {
  source: number;
  target: number;
}

export interface NodeStyles {
  color: string;
  outlineColor: string;
  radius: number;
}

export interface NodeData {
  url: string;
  label: string;
  allOwners: WebsiteRecordReference[];
  newestOwner: WebsiteRecordReference;
  links: string[];
}

interface WebsiteRecordReference {
  id: number;
  url: string;
}

export const CrawledNode: NodeStyles = {
  color: '#FFD740',
  outlineColor: '#673AB7',
  radius: 30,
};

export const NotCrawledNode: NodeStyles = {
  ...CrawledNode,
  color: '#FDE897',
  radius: 10,
};

export const FailedNode: NodeStyles = {
  ...CrawledNode,
  color: '#fa9696',
};

export const MainNode: NodeStyles = {
  ...CrawledNode,
  radius: 50,
};
