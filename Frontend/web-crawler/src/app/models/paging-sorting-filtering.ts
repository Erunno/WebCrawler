export enum SortDirection {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export function toSortDirection(dir: 'asc' | 'desc' | '') {
  return {
    '': SortDirection.ASCENDING,
    asc: SortDirection.ASCENDING,
    desc: SortDirection.DESCENDING,
  }[dir];
}

export interface PagingInfo {
  totalElements: number | null;
  pageSize: number;
  pageIndex: number;
}

export interface SortingInfo<TItem> {
  property: keyof TItem;
  direction: SortDirection;
}

export interface WebSiteFilteringInfo {
  label?: string;
  url?: string;
  tags?: string[];
}
