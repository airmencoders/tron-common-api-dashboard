import React from 'react';
import { useHookstate } from '@hookstate/core';
import Button from '../../../components/Button/Button';
import GridColumn from '../../../components/Grid/GridColumn';
import { createDefaultGridFilterParamsForType, generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import Modal from '../../../components/Modal/Modal';
import ModalFooterSubmit from '../../../components/Modal/ModalFooterSubmit';
import ModalTitle from '../../../components/Modal/ModalTitle';
import { useEventRequestLogState } from '../../../state/event-request-log/event-request-log-state';
import { EventRequestLogProps } from './event-request-log-props';
import { EventRequestLogState } from './event-request-log-state';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import FullPageInfiniteGrid from "../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";

const columns = [
  new GridColumn({
    field: 'eventType',
    sortable: true,
    filter: true,
    headerName: 'Type',
    resizable: true,
    filterParams: createDefaultGridFilterParamsForType('enum')
  }),
  new GridColumn({
    field: 'eventCount',
    sortable: true,
    filter: true,
    headerName: 'Event ID',
    resizable: true,
    filterParams: createDefaultGridFilterParamsForType('number')
  }),
  new GridColumn({
    field: 'wasSuccessful',
    sortable: true,
    filter: true,
    headerName: 'Successful',
    resizable: true,
    filterParams: createDefaultGridFilterParamsForType('boolean')
  }),
  new GridColumn({
    field: 'reason',
    sortable: true,
    filter: true,
    headerName: 'Reason',
    resizable: true,
  }),
  new GridColumn({
    field: 'lastAttempted',
    sortable: true,
    filter: true,
    headerName: 'Last Attempt',
    resizable: true,
    filterParams: createDefaultGridFilterParamsForType('date')
  })
];

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100
};

function EventRequestLog({ id }: EventRequestLogProps) {
  const eventRequestLogService = useEventRequestLogState();

  const eventRequestLogState = useHookstate<EventRequestLogState>({
    show: false
  });

  function eventRequestLogCloseHandler() {
    eventRequestLogState.merge({
      show: false
    });
  }

  function eventRequestLogOnClick() {
    eventRequestLogState.merge({
      show: true
    });
  }

  return (
    <>
      <div className="event-request-logs">
        <Button
          type="button"
          className="event-request-logs__btn"
          onClick={eventRequestLogOnClick}
          disabled={eventRequestLogState.show.get()}
        >
          View Event Logs
        </Button>
      </div>
      <Modal
        headerComponent={<ModalTitle title="Event Request Logs" />}
        footerComponent={<ModalFooterSubmit
          hideCancel
          onSubmit={eventRequestLogCloseHandler}
          submitText="Close"
        />}
        show={eventRequestLogState.show.get()}
        onHide={eventRequestLogCloseHandler}
        width="75%"
        height="auto"
      >
        <FullPageInfiniteGrid
          columns={columns}
          datasource={eventRequestLogService.createDatasource(id, infiniteScrollOptions)}
          cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
          maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
        />
      </Modal>
    </>
  );
}

export default EventRequestLog;