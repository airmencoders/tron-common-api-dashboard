import React from 'react';
import { State, useHookstate } from "@hookstate/core";
import { AppClientUserPrivFlat } from '../../state/app-source/app-client-user-priv-flat';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import GridColumn from '../../components/Grid/GridColumn';
import { RowClickedEvent } from 'ag-grid-community';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import AppSourceClientAddForm from './AppSourceClientAddForm';
import './AppSourceClientAdd.scss';
import ItemChooser from '../../components/ItemChooser/ItemChooser';

function AppSourceClientAdd(props: { data: State<AppClientUserPrivFlat[]> }) {
  const currentAppClients = props.data;
  const appClientState = useAppClientsState();
  const selectedClientState = useHookstate<AppClientUserPrivFlat>({
    appClientUser: '',
    appClientUserName: '',
    read: false,
    write: false
  });

  const columns = [
    new GridColumn({
      field: 'name',
      sortable: true,
      filter: true,
      headerName: 'App Clients'
    })
  ];

  function onRowClicked(event: RowClickedEvent) {
    const data = event.data as AppClientFlat;

    selectedClientState.set({
      appClientUser: data.id ?? '',
      appClientUserName: data.name,
      read: false,
      write: false
    });
  }

  function onSubmit(toUpdate: AppClientUserPrivFlat) {
    currentAppClients[currentAppClients.length].set(toUpdate);

    selectedClientState.set({
      appClientUser: '',
      appClientUserName: '',
      read: false,
      write: false
    });
  }

  return (
    <div className="app-source-client-add" data-testid="app-source-client-add">
      <p>Click an App Client below to add as an authorized client for this App Source.</p>

      <div className="app-source-client-add__grid-container">
        <ItemChooser
          items={appClientState.appClients.filter(item => {
            return currentAppClients.get().findIndex(curr => curr.appClientUser === item.id) === -1
          })}
          columns={columns}
          onRowClicked={onRowClicked}
        />
      </div>

      <AppSourceClientAddForm
        data={selectedClientState}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AppSourceClientAdd;
