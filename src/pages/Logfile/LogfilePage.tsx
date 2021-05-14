import { useLogfileState, usePastLogfileState } from '../../state/logfile/logfile-state';
import { useEffect, useRef } from 'react';
import PageFormat from '../../components/PageFormat/PageFormat';
import StatusCard from '../../components/StatusCard/StatusCard';
import { StatusType } from '../../components/StatusCard/status-type';
import { useState } from '@hookstate/core';
import Button from '../../components/Button/Button';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import './LogfilePage.scss';
import LogfileDownload from './LogfileDownload';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

function LogfilePage() {
  const serviceTitle = 'Logfile Service';
  const logfileState = useLogfileState();
  const pastLogfileState = usePastLogfileState();

  const sideDrawerState = useState<boolean>(false);

  const logsContainer = useRef<HTMLDivElement>(null);
  const lastLogElem = useRef<HTMLDivElement>(null);

  const timerState = useState<NodeJS.Timeout | undefined>(undefined);

  async function logsUpdate() {
    if (logfileState.isLoading) {
      return;
    }

    let shouldScroll = false;

    if (logsContainer.current) {
      shouldScroll = logsContainer.current.scrollHeight - logsContainer.current.scrollTop <= logsContainer.current.clientHeight + (logsContainer.current.clientHeight / 3);
    }

    await logfileState.fetchAndStoreCurrentLogfile();

    if (logfileState.error) {
      if (timerState.get())
        clearInterval(timerState.get()!);
    }

    if (shouldScroll)
      // lastLogElem.current?.scrollIntoView();
      logsContainer.current?.scrollTo(0, logsContainer.current.scrollHeight);
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
      <ErrorBoundary>
        {hasError() ?
          <StatusCard status={StatusType.ERROR} title={serviceTitle} />
          :
          <div className='logfile-page-container'>
            <div className='logfile-download-container default-panel-padding'>
              <Button className='logfile-download-container__open-btn' type={'button'} onClick={() => sideDrawerState.set(true)}>Show Downloads</Button>
              <SideDrawer isLoading={pastLogfileState.isPromised} title={'Logs Download'} isOpen={sideDrawerState.get()} onCloseHandler={onCloseHandler}>
                <LogfileDownload logfileDtos={pastLogfileState.getPastLogs} />
                <Button className='logfile-download-container__close-btn' type={'button'} onClick={onCloseHandler}>Close</Button>
              </SideDrawer>
            </div>
            <div className='logfile-container default-panel-padding'>
              <div className='logfile-container__header'>
                <h4 className='header__title'>Current Logfile</h4>
              </div>
              <div ref={logsContainer} className='logfile-container__logs'>
                {logfileState.getCurrentLog.map((item, index) => {
                  return (
                    <div key={index} className='logs__message'>
                      {item}
                    </div>
                  );
                })}
                <div className='logs_message--last-item' ref={lastLogElem}></div>
              </div>
            </div>
          </div>
        }
      </ErrorBoundary>
    </PageFormat>
  )
}

export default LogfilePage;