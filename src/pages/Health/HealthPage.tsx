import React, {useEffect} from 'react';
import {useHealthState} from '../../state/health/health-state';
import PageFormat from '../../components/PageFormat/PageFormat';
import StatusCard from '../../components/StatusCard/StatusCard';
import {StatusType} from '../../components/StatusCard/status-type';
import withLoading from '../../hocs/UseLoading/WithLoading';
import HealthService from '../../state/health/interface/health-service';

import './HealthPage.scss';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { GenericComponent } from '../../api/health/interface/components';

function HealthPage() {  
  const state = useHealthState();

  useEffect(() => {
    state.fetchAndStoreHealthStatus();
  }, []);

  const serviceTitle = 'Overall';

  return (
    <PageFormat pageTitle={"Health"}>
      <ErrorBoundary>
        {state.error ?
          <StatusCard status={StatusType.ERROR} title={serviceTitle} />
          :
          <ContentWithLoading state={state} serviceTitle={serviceTitle} />
        }
      </ErrorBoundary>
    </PageFormat>
  )
}

const getStatusTypeFromHealth = (healthStatus: string | undefined): StatusType => {
  if (healthStatus === 'UP' || healthStatus == 'APPSOURCE_UP') {
    return StatusType.GOOD;
  } else if (healthStatus === 'DOWN' || healthStatus == 'APPSOURCE_DOWN') {
    return StatusType.DOWN;
  } else if (healthStatus === 'UNKNOWN' || healthStatus == 'APPSOURCE_UNKNOWN') {
    return StatusType.UNKNOWN;
  } else if (healthStatus === 'WARNING') {
    return StatusType.WARNING;
  } else if (healthStatus === 'OUT_OF_SERVICE') {
    return StatusType.OUT_OF_SERVICE; 
  } else if (healthStatus === 'APPSOURCE_ERROR') {
    return StatusType.APPSOURCE_ERROR;
  } else { 
    return StatusType.ERROR;
  }
};

function HealthPageContent(props: { state: HealthService, serviceTitle: string }) { 
  const { state, serviceTitle } = props;
  const APP_SOURCE_HEALTH_PREFIX = "appsource_";
  return (
    <>
      <h3>System Components</h3>
      <hr/>
      <div className="health__status-cards">      
        <StatusCard status={getStatusTypeFromHealth(state.systemStatus)} title={serviceTitle} />
        <StatusCard status={getStatusTypeFromHealth(state.components?.db.status)} title="Database" />
      </div>
      <br/>
      { 
        Object
            .keys(state.components ?? {})
            .filter(item => item.startsWith(APP_SOURCE_HEALTH_PREFIX))
            .length > 0 ?
          <>
            <h3>App Sources</h3>
            <hr/>
            <div className="health__status-cards">
              { 
                Object
                  .keys(state.components ?? {})
                  .filter(item => item.startsWith(APP_SOURCE_HEALTH_PREFIX))
                  .map(item => 
                    <StatusCard 
                      key={item} 
                      status={getStatusTypeFromHealth(state.components?.[item].status)} 
                      title={item.replace(new RegExp("^" + APP_SOURCE_HEALTH_PREFIX), '')} 
                      details={"Last Up Time (UTC): " + ((state.components?.[item] as GenericComponent).details?.['Last Up Time'] ?? 'Unknown')}
                      error={(state.components?.[item] as GenericComponent).details?.['error'] ?? item.replace(new RegExp("^" + APP_SOURCE_HEALTH_PREFIX), '')}
                    />
                  )
              }
            </div>
          </>
        :
          null
      }
    </>
  );
}

const PageContentWithLoading = withLoading(HealthPageContent);
function ContentWithLoading(props: { state: HealthService, serviceTitle: string }) {
  return (
    <PageContentWithLoading isLoading={props.state.isPromised} {...props} />
  );
}

export default HealthPage;