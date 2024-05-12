import { Moment } from 'moment';
import { NodeId } from './graph';
export enum ExecutionNodeStatus {
  NOT_CRAWLED = 'NOT_CRAWLED',
  CRAWLED = 'CRAWLED',
  FAILED = 'FAILED',
}

export interface ApiNode {
  id: NodeId;
  url: string;
  title: string;

  crawlTime?: Moment;
  status: ExecutionNodeStatus;

  links: {
    url: string;
  }[];

  ownerWebsite: {
    id: number;
    label: string;
    url: string;
    isActive: boolean;
  };
}
