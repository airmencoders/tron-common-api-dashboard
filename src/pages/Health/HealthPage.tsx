import React, { useEffect } from 'react';
import { useHealthState } from '../../state/health/health-state';
import PageFormat from '../../components/PageFormat/PageFormat';
import StatusCard from '../../components/StatusCard/StatusCard';
import {StatusType} from '../../components/StatusCard/status-type';
import UseLoading from '../../hocs/UseLoading/UseLoading';
import HealthService from '../../state/health/interface/health-service';

function HealthPage() {
  const state = useHealthState();

  useEffect(() => {
    state.fetchAndStoreHealthStatus();
  }, []);

  const serviceTitle = "API Serivce";

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
    }
    return StatusType.ERROR;
  };

  const { state, serviceTitle } = props;

  return (
    <StatusCard status={getStatusTypeFromHealth(state.systemStatus)} title={serviceTitle} />
  );
}

const PageContentWithLoading = UseLoading(HealthPageContent);
function ContentWithLoading(props: { state: HealthService, serviceTitle: string }) {
  return (
    <PageContentWithLoading isLoading={props.state.isPromised} {...props} />
  );
}


export default HealthPage;
