import { Moment } from 'moment';
import { WebSiteExecutionStatus } from './execution-status';

export interface ExecutionRecord {
  id?: number;

  label: string;
  url: string;

  nodesCrawled: number;

  start: Moment | null;
  end?: Moment | null;

  executionStatus: WebSiteExecutionStatus;
}
