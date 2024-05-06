import { Moment } from 'moment';

export enum WebSiteEditMode {
  EDIT = 'edit',
  NEW = 'new',
}

export enum WebSiteExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  NOT_RUN = 'NOT_RUN',
  IN_QUEUE = 'IN_QUEUE',
}

export interface WebSiteRecord {
  id?: number;

  label: string;
  periodicityMinutes: number;
  url: string;
  boundaryRegExp: string;
  tags: string[];
  isActive: boolean;

  lastExecution?: Moment | null;
  executionStatus?: WebSiteExecutionStatus;
}
