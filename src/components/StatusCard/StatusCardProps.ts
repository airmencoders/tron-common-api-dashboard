import {StatusType} from './status-type';

export interface StatusCardProps {
  status: StatusType;
  title: string;
  details?: string;
  error?: string;
}
