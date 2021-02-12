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
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import './AppClientPage.scss';
import { usePrivilegeState } from '../../state/privilege/privilege-state';
import AppClientFormContainer from './AppClientFormContainer';
import { AppClientFormActionType } from './AppClientFormActionType';
import Button from '../../components/Button/Button';

const serviceTitle = "App Client Service";

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, true, 'READ'),
  new GridColumn('write', true, true, 'WRITE'),
];

interface AppClientPageState {
  isOpen: boolean,
  clientId: "",
  formAction: AppClientFormActionType
}

export const AppClientPage: FC = () => {
  const appClientState = useAppClientsState();
  const privilegeState = usePrivilegeState();
  const useSideDrawerState = useState<AppClientPageState>({
    isOpen: false,
    clientId: "",
    formAction: AppClientFormActionType.UPDATE
  });

  useEffect(() => {
    appClientState.fetchAndStoreAppClients();
    privilegeState.fetchAndStorePrivileges();
  }, []);

  function onRowClicked(event: RowClickedEvent): void {
    useSideDrawerState.set({
      clientId: event.data.id,
      formAction: AppClientFormActionType.UPDATE,
      isOpen: true,
    });
  }

  function onAddRow() {
    useSideDrawerState.set({
      clientId: "",
      formAction: AppClientFormActionType.ADD,
      isOpen: true,
    });
  }

  function onCloseHandler() {
    useSideDrawerState.set((prev) => {
      return {
        ...prev,
        isOpen: false,
        clientId: "",
      }
    })
  }

  function getAppClient(): AppClientFlat | undefined {
    if (useSideDrawerState.formAction.value === AppClientFormActionType.UPDATE)
      return appClientState.appClients?.find(appClient => appClient.id.get() === useSideDrawerState.clientId.get())?.get();
    else
      return undefined;
  }

  return (
    <PageFormat pageTitle={"Application Clients"}>
      <Container fluid style={{ height: '100%' }}>
        {appClientState.isPromised || privilegeState.error ?
          <Spinner animation="border" role="status" variant="primary">
            <span className="sr-only">Loading...</span>
          </Spinner>
          :
          <div style={{ height: '100%' }}>
            {appClientState.error || privilegeState.error ?
              <StatusCard status={StatusType.ERROR} title={serviceTitle} />
              :
              <>
                <div className="add-app-client">
                  <Button type="button" className="add-app-client__btn" onClick={onAddRow}>Add App Client</Button>
                </div>

                <Grid
                  data={appClientState.appClients?.get() || []}
                  columns={columnHeaders}
                  onRowClicked={onRowClicked}
                  rowClass="ag-grid--row-pointer"
                />

                <SideDrawer title={"App Client Editor"} isOpen={useSideDrawerState.isOpen.get()} onCloseHandler={onCloseHandler}>
                  {useSideDrawerState.clientId.get() &&
                    <AppClientFormContainer client={getAppClient()} type={useSideDrawerState.formAction.get()} />
                  }

                  {!useSideDrawerState.clientId.get() &&
                    <AppClientFormContainer type={useSideDrawerState.formAction.get()} />
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
