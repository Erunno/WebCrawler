export enum WebSiteExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  NOT_RUN = 'NOT_RUN',
  IN_QUEUE = 'IN_QUEUE',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const statusToMessage: Record<any, string> = {
  [WebSiteExecutionStatus.SUCCESS]: 'Success',
  [WebSiteExecutionStatus.FAILED]: 'Failed',
  [WebSiteExecutionStatus.RUNNING]: 'Running',
  [WebSiteExecutionStatus.NOT_RUN]: 'Not Run',
  [WebSiteExecutionStatus.IN_QUEUE]: 'In Queue',
};
