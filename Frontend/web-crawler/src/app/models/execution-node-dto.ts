import moment from 'moment';
import { ApiNode, ExecutionNodeStatus } from './node-api';

export interface ExecutionNodeDto {
  identifier: number;
  title: string;
  url: string;
  crawlTime?: string;
  status: ExecutionNodeStatus;
  links: {
    identifier: number;
    url: string;
  }[];
  owner: {
    identifier: number;
    label: string;
    url: string;
    active: boolean;
  };
}

export function toApiNode(dto: ExecutionNodeDto) {
  return {
    id: dto.url,
    url: dto.url,
    ownerWebsite: {
      id: dto.owner.identifier,
      label: dto.owner.label,
      url: dto.owner.url,
      isActive: dto.owner.active,
    },
    status: dto.status,
    crawlTime: dto.crawlTime ? moment(dto.crawlTime) : null,
    title: dto.title,
    links: dto.links.map((l) => ({
      nodeId: l.identifier,
      url: l.url,
    })),
  } as ApiNode;
}
