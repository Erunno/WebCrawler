import { Moment } from 'moment';
import { WebSiteExecutionStatus } from './execution-status';

export enum WebSiteEditMode {
  EDIT = 'edit',
  NEW = 'new',
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
