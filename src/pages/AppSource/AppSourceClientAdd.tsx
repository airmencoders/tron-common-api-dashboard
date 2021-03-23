import React from 'react';
import { State, useHookstate } from "@hookstate/core";
import { AppClientUserPrivFlat } from '../../state/app-source/app-client-user-priv-flat';
import Grid from '../../components/Grid/Grid';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import GridColumn from '../../components/Grid/GridColumn';
import { RowClickedEvent } from 'ag-grid-community';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import AppSourceClientAddForm from './AppSourceClientAddForm';

function AppSourceClientAdd(props: { data: State<AppClientUserPrivFlat[]> }) {
  const currentAppClients = props.data;
  const appClientState = useAppClientsState();
  const formState = useHookstate<AppClientUserPrivFlat>({
    appClientUser: '',
    appClientUserName: '',
    read: false,
    write: false
  });

  const columns = [
    new GridColumn('name', true, true, 'App Clients')
  ];

  function onRowClicked(event: RowClickedEvent) {
    const data = event.data as AppClientFlat;

    formState.set({
      appClientUser: data.id ?? '',
      appClientUserName: data.name,
      read: false,
      write: false
    });
  }

  function onSubmit(toUpdate: AppClientUserPrivFlat) {
    currentAppClients[currentAppClients.length].set(toUpdate);

    formState.set({
      appClientUser: '',
      appClientUserName: '',
      read: false,
      write: false
    });
  }

  return (
    <>
      <div style={{ height: "30vh" }}>
        <Grid
          data={
            appClientState.appClients.filter(item => {
              return currentAppClients.get().findIndex(curr => curr.appClientUser === item.id) === -1
            })
          }
          height="100%"
          columns={columns}
          onRowClicked={onRowClicked}
          rowClass="ag-grid--row-pointer"
        />
      </div>

      <AppSourceClientAddForm
        data={formState}
        onSubmit={onSubmit}
      />
    </>
  );
}

export default AppSourceClientAdd;
