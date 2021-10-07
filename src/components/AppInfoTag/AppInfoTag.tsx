import { useHookstate } from '@hookstate/core';
import { Tag } from '@trussworks/react-uswds';
import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import ProductionIcon from '../../icons/ProductionIcon';
import StagingIcon from '../../icons/StagingIcon';
import { useAppVersionState } from '../../state/app-info/app-info-state';
import './AppInfoTag.scss';

export default function AppInfoTag() {
  const appInfoService = useAppVersionState();
  const [tipClass, setTipClass] = React.useState('sidebar__tags-tip-hidden');

  useEffect(() => {
    appInfoService.fetchVersion();
  }, []);

  if (appInfoService.state.promised) {
    return (
      <div className="sidebar__tags-container">
        <Spinner animation="border" />
      </div>
    );
  }

  function getLabelContent() {
    if (appInfoService.state.environment.get()?.match(/staging/i)) {
      return (
        <>
          <StagingIcon />
          <span className="sidebar__apptag--staging">{`${
            appInfoService.state.enclave.get()?.toUpperCase() ?? ''
          } STAGING`}</span>
        </>
      );
    } else if (appInfoService.state.environment.get()?.match(/production/i)) {
      return (
        <>
          <ProductionIcon />
          <span className="sidebar__apptag--production">{`${
            appInfoService.state.enclave.get()?.toUpperCase() ?? ''
          } PRODUCTION`}</span>
        </>
      );
    } else {
      return (<span className="sidebar__apptag--production">{`${
        appInfoService.state.enclave.get()?.toUpperCase() ?? ''
      } ENV`}</span>);
    }
  }

  return (
    <div
      className="sidebar__tags-container"
      onMouseOver={() => setTipClass('sidebar__tags-tip-show')}
      onMouseLeave={() => setTipClass('sidebar__tags-tip-hidden')}
    >
      <Tag className="sidebar__apptag">
        {
          <>
            {getLabelContent()}
            <div className={tipClass}>
              {`App Ver: ${appInfoService.state.version.get() ?? 'Unknown'}`}
            </div>
          </>
        }
      </Tag>
    </div>
  );
}
