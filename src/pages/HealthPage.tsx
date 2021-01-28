import React, {FC, useEffect} from 'react';
import {Container, Spinner} from 'react-bootstrap';
import {useHealthState} from '../state/health/health-state';
import PageFormat from '../components/PageFormat/PageFormat';
import StatusCard from '../components/StatusCard/StatusCard';
import {StatusType} from '../components/StatusCard/status-type';

export const HealthPage: FC = () => {
  const state = useHealthState();

  useEffect(() => {
    state.fetchAndStoreHealthStatus();
  }, []);

  const getStatusTypeFromHealth = (healthStatus: string | undefined): StatusType => {
    if (healthStatus === 'UP') {
      return StatusType.GOOD;
    }
    return StatusType.ERROR;
  };

  return (
    <PageFormat pageTitle={"Health"}>
      <Container fluid>
        {state.isPromised ?
          <Spinner animation="border" role="status" variant="primary">
            <span className="sr-only">Loading...</span>
          </Spinner>
          :
          <div>
            {state.error ?
              <p>{state.error}</p>
              :
              <StatusCard status={getStatusTypeFromHealth(state.systemStatus)}
                title="API Service" />
            }

          </div>
        }
      </Container>
    </PageFormat>

  )
}
