import { useState } from '@hookstate/core';
import { GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import React, { FC, useEffect, useState as useReactState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { AppClientFlat } from '../api/app-clients/interface/app-client-flat';
import Button from '../components/Button/Button';
import Form from '../components/forms/Form/Form';
import Grid from '../components/Grid/Grid';
import GridColumn from '../components/Grid/GridColumn';
import PageFormat from '../components/PageFormat/PageFormat';
import SideDrawer from '../components/SideDrawer/SideDrawer';
import { StatusType } from '../components/StatusCard/status-type';
import StatusCard from '../components/StatusCard/StatusCard';
import { accessAppClientsState, useAppClientsState } from '../state/app-clients/app-clients-state';
import Label from '../components/forms/Label/Label';
import TextInput from '../components/forms/TextInput/TextInput';

const serviceTitle = "App Client Service";

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, true, 'READ'),
  new GridColumn('write', true, true, 'WRITE'),
  new GridColumn('dashboard_admin', true, true, 'DASHBOARD ADMIN'),
  new GridColumn('dashboard_user', true, true, 'DASHBOARD USER'),
];

export const AppClientPage: FC = () => {
  const state = useAppClientsState();
  const [gridApi, setGridApi] = useReactState<GridApi | null>(null);

  const useSideDrawerState = useState({
    isOpen: false,
    clientId: "",
    rowNodeId: ""
  });

  useEffect(() => {
    state.fetchAndStoreAppClients();
  }, []);


  // const useGridApi = useState<GridApi | null>(null);

  function onRowClicked(event: RowClickedEvent): void {
    useSideDrawerState.isOpen.set(true);
    useSideDrawerState.clientId.set(event.data.id);
    useSideDrawerState.rowNodeId.set(event.node.id || "");
  }

  function onCloseHandler() {
    useSideDrawerState.isOpen.set(false);
  }

  function storeGridApi(event: GridReadyEvent) {
    setGridApi(event.api);
    // useGridApi.set(event.api);
  }

  function onSubmit(event: any) {
    event.preventDefault();
    console.log('submitted');
    state.appClients.set((prevState) => {
      const updated: AppClientFlat[] = Object.assign([], [...prevState]);
      updated[0].name = 'changed';
      return updated;
    });
    // Update the grid item on success
    // gridApi?.getRowNode(useSideDrawerState.rowNodeId.get())?.setData(savedObj);
  }

  function getAppClient(): AppClientFlat | undefined {
    return accessAppClientsState().appClients.find(appClient => appClient.id.get() === useSideDrawerState.clientId.get())?.get();
  }

  return (
    <PageFormat pageTitle={"Application Clients"}>
      <Container fluid style={{ height: '100%' }}>
        {state.isPromised ?
          <Spinner animation="border" role="status" variant="primary">
            <span className="sr-only">Loading...</span>
          </Spinner>
          :
          <div style={{ height: '100%' }}>
            {state.error ?
              <StatusCard status={StatusType.ERROR} title={serviceTitle} />
              :
              <>
                <Grid data={state.appClients.get()} columns={columnHeaders}
                      onRowClicked={onRowClicked} getGridApi={storeGridApi} />

                {useSideDrawerState.clientId.get().length > 0 &&
                  <SideDrawer title={"Editor"} isOpen={useSideDrawerState.isOpen.get()} onCloseHandler={onCloseHandler}>
                    <ClientAppForm client={getAppClient()} onSubmit={onSubmit} />
                  </SideDrawer>
                }
              </>
            }

          </div>
        }
      </Container>
    </PageFormat>

  )
}

function ClientAppForm(props: { client?: AppClientFlat, onSubmit: (event: any) => void }) {
  return (
    <>
      {props.client ?
        <Form onSubmit={props.onSubmit}>
          <Label htmlFor="name">Client Name</Label>
          <TextInput id="name" name="name" type="text" defaultValue={props.client.name} />

          <Label htmlFor="read">Read</Label>

          <Label htmlFor="write">Write</Label>

          <Label htmlFor="dashboard_user">Dashboard User</Label>

          <Label htmlFor="dashboard_admin">Dashboard Admin</Label>
          <Button type={'submit'} onClick={props.onSubmit}>Submit</Button>

        </Form>
        :
        <p>There was an error loading client details...</p>
      }
    </>
  );
}
