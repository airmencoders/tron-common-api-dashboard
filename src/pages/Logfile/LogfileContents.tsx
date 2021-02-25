import React, { useEffect, useRef } from 'react';
import PageFormat from '../../components/PageFormat/PageFormat';
import { StatusType } from '../../components/StatusCard/status-type';
import StatusCard from '../../components/StatusCard/StatusCard';
import { useLogfileState, usePastLogfileState } from '../../state/logfile/logfile-state';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import './LogfilePage.scss';
import { useState } from '@hookstate/core';
import Button from '../../components/Button/Button';

export function LogfileContents() {
  const serviceTitle = 'Logfile Service';
  const logfileState = useLogfileState();
  const pastLogfileState = usePastLogfileState();

  const sideDrawerState = useState<boolean>(false);

  const logsContainer = useRef<HTMLPreElement>(null);
  const lastLogElem = useRef<HTMLDivElement>(null);

  const timerState = useState<NodeJS.Timeout | undefined>(undefined);

  async function logsUpdate() {
    if (logfileState.isLoading) {
      return;
    }

    let shouldScroll: boolean = false;

    if (logsContainer.current) {
      shouldScroll = logsContainer.current.scrollHeight - logsContainer.current.scrollTop <= logsContainer.current.clientHeight + (logsContainer.current.clientHeight / 3);
    }

    await logfileState.fetchAndStoreCurrentLogfile();

    if (logfileState.error) {
      if (timerState.get())
        clearInterval(timerState.get()!);
    }

    if (shouldScroll)
      lastLogElem.current?.scrollIntoView();
  }

  useEffect(() => {
    pastLogfileState.fetchAndStorePastLogfiles();
    logsUpdate();

    timerState.set(setInterval(function () {
      logsUpdate();
    }, logfileState.getRefreshRate));

    return function cleanup() {
      clearInterval(timerState.get()!);
      logfileState.clearState();
    };
  }, []);

  function onCloseHandler() {
    sideDrawerState.set(false);
  }

  function hasError() {
    return logfileState.error || pastLogfileState.error;
  }

  return (
    <PageFormat pageTitle={'Logfile'}>
      {hasError() ?
        <StatusCard status={StatusType.ERROR} title={serviceTitle} />
        :
        <div className='logfile-page-container'>
          <div className='logfile-download-container default-panel-padding'>
            <Button className='logfile-download-container__open-btn' type={'button'} onClick={() => sideDrawerState.set(true)}>Show Downloads</Button>
            <SideDrawer title={'Logs Download'} isOpen={sideDrawerState.get()} onCloseHandler={onCloseHandler}>
              <ul>
                {pastLogfileState.getPastLogs?.map((item) => {
                  return (
                    <li key={item.name.get()}>
                      <a href={item.downloadUri.get()}>{item.name.get()}</a>
                    </li>
                  );
                })}
              </ul>
              <Button className='logfile-download-container__close-btn' type={'button'} onClick={() => sideDrawerState.set(false)}>Close</Button>
            </SideDrawer>
          </div>
          <div className='logfile-container default-panel-padding'>
            <div className='logfile-container__header'>
              <h4 className='header__title'>Current Logfile</h4>
            </div>
            <pre ref={logsContainer} className='logfile-container__logs'>
              {logfileState.getCurrentLog.map((item, index) => {
                return (
                  <div key={index} className='logs__message'>
                    {item}
                  </div>
                );
              })}
              <div ref={lastLogElem}></div>
            </pre>
          </div>
        </div>
      }
    </PageFormat>
  )
}