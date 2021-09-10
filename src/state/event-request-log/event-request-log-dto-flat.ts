import { EventRequestLogDtoEventTypeEnum } from '../../openapi';

export interface EventRequestLogDtoFlat {
  eventType?: EventRequestLogDtoEventTypeEnum;
  eventCount?: number;
  wasSuccessful?: boolean;
  reason?: string;
  lastAttempted?: string;
}