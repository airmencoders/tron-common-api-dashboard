import { RowClickedEvent } from 'ag-grid-community';
import React, { useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
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
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import {useAppClientPageState} from './app-client-page-state';

const serviceTitle = "App Client Service";

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, false, 'READ', 'header-center',
      PrivilegeCellRenderer),
  new GridColumn('write', true, false, 'WRITE', 'header-center',
      PrivilegeCellRenderer),
];

export function AppClientPage() {
  const appClientState = useAppClientsState();
  const privilegeState = usePrivilegeState();

  const appClientPageState = useAppClientPageState();

  useEffect(() => {
    appClientState.fetchAndStoreAppClients();
    privilegeState.fetchAndStorePrivileges();
    return () => {
      appClientPageState.set({
        isOpen: false,
        formAction: undefined,
        client: undefined
      });
    }
  }, []);

  function onRowClicked(event: RowClickedEvent): void {
    appClientPageState.set({
      formAction: AppClientFormActionType.UPDATE,
      isOpen: true,
      client: event.data
    });
  }

  function onAddClientClick() {
    appClientPageState.set({
      formAction: AppClientFormActionType.ADD,
      isOpen: true,
      client: undefined
    });
  }

  function onCloseHandler() {
    appClientPageState.set({
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
                  <Button type="button" className="add-app-client__btn" onClick={onAddClientClick}>Add App Client</Button>
                </div>

                <Grid
                  data={appClientState.appClients?.get() || []}
                  columns={columnHeaders}
                  onRowClicked={onRowClicked}
                  rowClass="ag-grid--row-pointer"
                />

                <SideDrawer title={"App Client Editor"} isOpen={appClientPageState.isOpen.get()} onCloseHandler={onCloseHandler}>
                  {appClientPageState.client.get() && appClientPageState.formAction.value === AppClientFormActionType.UPDATE ?
                    <AppClientEdit client={appClientPageState.client.get()} />
                    : appClientPageState.formAction.value === AppClientFormActionType.ADD ?
                      <AppClientAdd />
                      :
                      null
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
