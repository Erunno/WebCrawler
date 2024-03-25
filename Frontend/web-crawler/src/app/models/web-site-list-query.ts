import { SortDirection } from './paging-sorting-filtering';
import { WebSiteRecord } from './web-site-record';

export interface WebSiteListQuery {
  page?: string;
  pageSize?: string;
  sort?: keyof WebSiteRecord;
  sortDirection?: SortDirection;
  label?: string;
  tags?: string;
  url?: string;
}
