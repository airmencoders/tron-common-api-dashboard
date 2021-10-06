import { useHookstate } from '@hookstate/core';
import { Tag } from '@trussworks/react-uswds';
import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
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

  return (
    <div
      className="sidebar__tags-container"
      onMouseOver={() => setTipClass('sidebar__tags-tip-show')}
      onMouseLeave={() => setTipClass('sidebar__tags-tip-hidden')}
    >
      <Tag className="sidebar__apptag">
        {
          <>
            <span className={`enclave__${appInfoService.state.enclave.get()?.toLowerCase()}`}>{`${
              appInfoService.state.enclave.get()?.toUpperCase() ?? ''
            } `}</span>
            <span className={`environ__${appInfoService.state.environment.get()?.toLowerCase()}`}>{` ${
              appInfoService.state.environment.get()?.toUpperCase() ?? ''
            } `}</span>
            <div className={tipClass}>
              {`App Ver: ${appInfoService.state.version.get() ?? 'Unknown'}`}
            </div>
          </>
        }
      </Tag>
    </div>
  );
}
