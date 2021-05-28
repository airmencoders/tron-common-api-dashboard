import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import { SubscriberDto } from '../../openapi';
import { useSubscriptionState } from '../../state/pub-sub/pubsub-state';
import PubSubDelete from './PubSubDelete';
import PubSubForm from './PubSubForm';

const columns: GridColumn[] = [
  new GridColumn({
    field: 'id',
    sortable: true,
    filter: true,
    headerName: 'UUID'
  }),
  new GridColumn({
    field: 'subscriberAddress',
    sortable: true,
    filter: true,
    headerName: 'Subscriber URL'
  }),
  new GridColumn({
    field: 'subscribedEvent',
    sortable: true,
    filter: true,
    headerName: 'Subscribed Event',

  }),
];

function PubSubPage() {
  return (
    <DataCrudFormPage<SubscriberDto, SubscriberDto>
      columns={columns}
      dataTypeName='Subscriber'
      pageTitle='Pub Sub Subscribers'
      createForm={PubSubForm}
      updateForm={PubSubForm}
      useDataState={useSubscriptionState}
      allowEdit={true}
      allowDelete
      allowAdd
      deleteComponent={PubSubDelete}
      autoResizeColumns
      autoResizeColummnsMinWidth={1200}
    />
  )
}

export default PubSubPage;