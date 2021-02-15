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
import { AppClientFormActionType } from './AppClientFormActionType';
import Button from '../../components/Button/Button';
import AppClientEdit from './AppClientEdit';
import AppClientAdd from './AppClientAdd';

const serviceTitle = "App Client Service";

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, true, 'READ'),
  new GridColumn('write', true, true, 'WRITE'),
];

interface AppClientPageState {
  isOpen: boolean,
  formAction?: AppClientFormActionType,
  client?: AppClientFlat
}

export const AppClientPage: FC = () => {
  const appClientState = useAppClientsState();
  const privilegeState = usePrivilegeState();
  const useSideDrawerState = useState<AppClientPageState>({
    isOpen: false,
    formAction: undefined,
    client: undefined
  });

  useEffect(() => {
    appClientState.fetchAndStoreAppClients();
    privilegeState.fetchAndStorePrivileges();
  }, []);

  function onRowClicked(event: RowClickedEvent): void {
    useSideDrawerState.set({
      formAction: AppClientFormActionType.UPDATE,
      isOpen: true,
      client: event.data
    });
  }

  function onAddRow() {
    useSideDrawerState.set({
      formAction: AppClientFormActionType.ADD,
      isOpen: true,
      client: undefined
    });
  }

  function onCloseHandler() {
    useSideDrawerState.set({
      formAction: undefined,
      client: undefined,
      isOpen: false,
    });
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
                  {useSideDrawerState.client.get() && useSideDrawerState.formAction.value === AppClientFormActionType.UPDATE ?
                    <AppClientEdit client={useSideDrawerState.client.get()} />
                    : useSideDrawerState.formAction.value === AppClientFormActionType.ADD ?
                      <AppClientAdd />
                      :
                      <></>
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
