import React, { FC, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import Grid from '../components/Grid/Grid';
import GridColumn from '../components/Grid/GridColumn';
import PageFormat from '../components/PageFormat/PageFormat';
import { StatusType } from '../components/StatusCard/status-type';
import StatusCard from '../components/StatusCard/StatusCard';
import { useAppClientsState } from '../state/app-clients/app-clients-state';

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

  useEffect(() => {
    state.fetchAndStoreAppClients();
  }, []);

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
              <Grid data={state.appClients || []} columns={columnHeaders} />
            }

          </div>
        }
      </Container>
    </PageFormat>

  )
}
