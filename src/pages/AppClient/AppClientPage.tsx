import { useState } from '@hookstate/core';
import { RowClickedEvent } from 'ag-grid-community';
import React, { FC, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import Grid from '../../components/Grid/Grid';
import GridColumn from '../../components/Grid/GridColumn';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { StatusType } from '../../components/StatusCard/status-type';
import StatusCard from '../../components/StatusCard/StatusCard';
import { accessAppClientsState, useAppClientsState } from '../../state/app-clients/app-clients-state';
import AppClientForm from './AppClientForm';

const serviceTitle = "App Client Service";

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, true, 'READ'),
  new GridColumn('write', true, true, 'WRITE'),
  new GridColumn('dashboard_admin', true, true, 'DASHBOARD_ADMIN'),
  new GridColumn('dashboard_user', true, true, 'DASHBOARD_USER')
]

export const AppClientPage: FC = () => {
  const state = useAppClientsState();

  const useSideDrawerState = useState({
    isOpen: false,
    clientId: "",
  });

  useEffect(() => {
    state.fetchAndStoreAppClients();
  }, []);

  function onRowClicked(event: RowClickedEvent): void {
    useSideDrawerState.isOpen.set(true);
    useSideDrawerState.clientId.set(event.data.id);
  }

  function onCloseHandler() {
    useSideDrawerState.isOpen.set(false);
    useSideDrawerState.clientId.set("");
  }

  function getAppClient(): AppClientFlat | undefined {
    return accessAppClientsState().appClients?.find(appClient => appClient.id.get() === useSideDrawerState.clientId.get())?.get();
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
                <Grid data={state.appClients?.get() || []} columns={columnHeaders}
                  onRowClicked={onRowClicked} />

                <SideDrawer title={"Client Editor"} isOpen={useSideDrawerState.isOpen.get()} onCloseHandler={onCloseHandler}>
                  {useSideDrawerState.clientId.get().length > 0 &&
                    <AppClientForm client={getAppClient()} />
                  }
                </SideDrawer>
              </>
            }

          </div>
        }
      </Container>
    </PageFormat>

  )
}
