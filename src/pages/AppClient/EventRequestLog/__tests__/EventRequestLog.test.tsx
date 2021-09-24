import { fireEvent, render } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import { EventRequestLogControllerApi, EventRequestLogControllerApiInterface, EventRequestLogDtoEventTypeEnum, EventRequestLogDtoPaginationResponseWrapper } from '../../../../openapi';
import EventRequestLogService from '../../../../state/event-request-log/event-request-log-service';
import { useEventRequestLogState } from '../../../../state/event-request-log/event-request-log-state';
import { createAxiosSuccessResponse } from '../../../../utils/TestUtils/test-utils';
import EventRequestLog from '../EventRequestLog';

jest.mock('../../../../state/event-request-log/event-request-log-state');

describe('Test Event Request Log', () => {
  const appId = "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8";

  const eventRequestLogResponse: AxiosResponse<EventRequestLogDtoPaginationResponseWrapper> = createAxiosSuccessResponse({
    data: [
      {
        appClientUser: {
          id: appId,
          name: "guardianangel"
        },
        eventType: EventRequestLogDtoEventTypeEnum.OrganizationChange,
        eventCount: 523,
        wasSuccessful: false,
        reason: "Event request to recipient failed: 404 NOT_FOUND",
        lastAttempted: "2021-09-03T12:56:44.482Z"
      }
    ],
    pagination: {
      page: 0,
      size: 1,
      totalElements: 29,
      totalPages: 15,
      links: {
        next: "http://localhost:8888/api/v2/event-request-log/all?page=1&size=2",
        last: "http://localhost:8888/api/v2/event-request-log/all?page=14&size=2"
      }
    }
  });

  let eventRequestLogApi: EventRequestLogControllerApiInterface;

  beforeEach(() => {
    eventRequestLogApi = new EventRequestLogControllerApi();

    (useEventRequestLogState as jest.Mock).mockReturnValue(new EventRequestLogService(eventRequestLogApi));
  });

  it('should show button to load', async () => {
    const page = render(
      <EventRequestLog id={appId} />
    );

    expect(page.getByText('View Event Logs')).toBeInTheDocument();
  });

  it('should show modal on button click', async () => {
    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.resolve(eventRequestLogResponse);
    });

    const page = render(
      <EventRequestLog id={appId} />
    );

    const viewLogsBtn = page.getByText('View Event Logs');
    expect(viewLogsBtn).toBeInTheDocument();
    fireEvent.click(viewLogsBtn);

    expect(page.getByText('Event Request Logs')).toBeInTheDocument();
  });

  it('should close modal on Close button click', async () => {
    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.resolve(eventRequestLogResponse);
    });

    const page = render(
      <EventRequestLog id={appId} />
    );

    const viewLogsBtn = page.getByText('View Event Logs');
    expect(viewLogsBtn).toBeInTheDocument();
    fireEvent.click(viewLogsBtn);

    expect(page.getByText('Event Request Logs')).toBeInTheDocument();

    const closeBtn = page.getByText('Close');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);

    expect(page.queryByText('Event Request Logs')).not.toBeInTheDocument();
  });
});
