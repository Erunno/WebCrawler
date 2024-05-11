import { Moment } from 'moment';
export enum ExecutionNodeStatus {
  NOT_CRAWLED = 'NOT_CRAWLED',
  CRAWLED = 'CRAWLED',
  FAILED = 'FAILED',
}

export interface ApiNode {
  id: number;
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
  };
}
