import { Moment } from 'moment';

export enum WebSiteEditMode {
  EDIT = 'edit',
  NEW = 'new',
}

export enum WebSiteExecutionStatus {
  FAILED = 'failed',
  SUCCESS = 'success',
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
