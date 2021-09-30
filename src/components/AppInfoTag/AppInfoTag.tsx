import { useHookstate } from '@hookstate/core';
import { Tag } from '@trussworks/react-uswds';
import React, { useEffect } from 'react';
import { useAppVersionState } from '../../state/app-info/app-info-state';
import './AppInfoTag.scss';

export default function AppInfoTag() {
  const appInfoService = useAppVersionState();
  const [tipClass, setTipClass] = React.useState('sidebar__tags-tip-hidden');
  const [enclave, setEnclave] = React.useState<string>('');
  const [env, setEnv] = React.useState<string>('');

  useEffect(() => {
    appInfoService.fetchVersion().then(() => getClassName());
  }, []);

  function getClassName() {
    if (appInfoService.state.enclave.get()?.toUpperCase() === 'IL4') {
      setEnclave('il4');
    } else if (appInfoService.state.enclave.get()?.toUpperCase() === 'IL2') {
      setEnclave('il2');
    } else {
      setEnclave('???');
    }

    if (
      appInfoService.state.environment.get()?.toUpperCase() === 'PRODUCTION'
    ) {
      setEnv('prod');
    } else if (
      appInfoService.state.environment.get()?.toUpperCase() === 'STAGING'
    ) {
      setEnv('staging');
    } else {
      setEnv('---');
    }
  }

  return (
    <div className="sidebar__tags-container"
    onMouseOver={() => setTipClass('sidebar__tags-tip-show')}
    onMouseLeave={() => setTipClass('sidebar__tags-tip-hidden')}>
      <Tag className="sidebar__apptag">
        {
          <>
            <span className={`enclave__${enclave}`}>{`${
              appInfoService.state.enclave.get()?.toUpperCase() ?? ''
            } `}</span>
            <span className={`environ__${env}`}>{` ${
              appInfoService.state.environment.get()?.toUpperCase() ?? ''
            } `}</span>
                  <div
        className={tipClass}
      >
        {`App Ver: ${appInfoService.state.version.get() ?? 'Unknown'}`}
      </div>
          </>
        }
      </Tag>

    </div>
  );
}
