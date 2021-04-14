import React, {useEffect} from 'react';
import {useHealthState} from '../../state/health/health-state';
import PageFormat from '../../components/PageFormat/PageFormat';
import StatusCard from '../../components/StatusCard/StatusCard';
import {StatusType} from '../../components/StatusCard/status-type';
import withLoading from '../../hocs/UseLoading/WithLoading';
import HealthService from '../../state/health/interface/health-service';

import './HealthPage.scss';
import {Container} from 'react-bootstrap';

function HealthPage() {
  const state = useHealthState();

  useEffect(() => {
    state.fetchAndStoreHealthStatus();
  }, []);

  const serviceTitle = 'Overall';

  return (
    <PageFormat pageTitle={"Health"}>
      {state.error ?
        <StatusCard status={StatusType.ERROR} title={serviceTitle} />
        :
        <ContentWithLoading state={state} serviceTitle={serviceTitle} />
      }
    </PageFormat>

  )
}

function HealthPageContent(props: { state: HealthService, serviceTitle: string }) {
  const getStatusTypeFromHealth = (healthStatus: string | undefined): StatusType => {
    if (healthStatus === 'UP') {
      return StatusType.GOOD;
    } else if (healthStatus === 'DOWN') {
      return StatusType.DOWN;
    } else {
      return StatusType.ERROR;
    }
  };

  const { state, serviceTitle } = props;

  return (
      <Container>
        <div className="health__status-cards">
          <StatusCard status={getStatusTypeFromHealth(state.systemStatus)} title={serviceTitle} />
          <StatusCard status={getStatusTypeFromHealth(state.components?.db.status)} title="Database" />
          <StatusCard status={getStatusTypeFromHealth(state.components?.rabbit?.status)} title="RabbitMQ" />
        </div>
      </Container>
  );
}

const PageContentWithLoading = withLoading(HealthPageContent);
function ContentWithLoading(props: { state: HealthService, serviceTitle: string }) {
  return (
    <PageContentWithLoading isLoading={props.state.isPromised} {...props} />
  );
}


export default HealthPage;
