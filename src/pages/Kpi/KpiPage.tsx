import React, { useEffect } from 'react';
import { useHookstate } from '@hookstate/core';
import { CancelTokenSource } from 'axios';
import PageFormat from '../../components/PageFormat/PageFormat';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { useKpiState } from '../../state/kpi/kpi-state';
import KpiContentWithLoading from './KpiSummaryContentWithLoading';
import './KpiPage.scss';
import { KpiType } from './kpi-type';
import KpiSeriesContentWithLoading from './KpiSeriesContentWithLoading';
import KpiDatePicker from './KpiDatePicker';

interface KpiPageState {
  kpiType?: KpiType;
  cancelTokenSource?: CancelTokenSource;
}

function KpiPage() {
  const kpiService = useKpiState();
  const pageState = useHookstate<KpiPageState>({
    kpiType: undefined,
    cancelTokenSource: undefined
  });

  useEffect(() => {
    return function cleanup() {
      pageState.cancelTokenSource.value?.cancel();
      kpiService.resetState();
    }
  }, []);

  function fetchKpiSummary(startDate: string, endDate: string): void {
    const cancellablePromise = kpiService.fetchAndStoreData(startDate, endDate);

    cancellablePromise.promise.catch(err => {
      createTextToast(ToastType.ERROR, err.message);
    });

    pageState.kpiType.set(KpiType.SUMMARY);
    pageState.cancelTokenSource.set(cancellablePromise.cancelTokenSource);
  }

  function fetchKpiSeries(startDate: string, endDate: string): void {
    const cancellablePromise = kpiService.fetchAndStoreSeriesData(startDate, endDate);

    cancellablePromise.promise.catch(err => {
      createTextToast(ToastType.ERROR, err.message);
    });

    pageState.kpiType.set(KpiType.SERIES);
    pageState.cancelTokenSource.set(cancellablePromise.cancelTokenSource);
  }

  return (
    <PageFormat pageTitle="KPIs">
      <div className="kpi-content">
        <div className="kpi-content__date-picker">
          <KpiDatePicker
            kpiType={KpiType.SUMMARY}
            onClickCallBack={fetchKpiSummary}
          />

          <KpiDatePicker
            kpiType={KpiType.SERIES}
            onClickCallBack={fetchKpiSeries}
          />
        </div>

        {!kpiService.error && pageState.kpiType.value === KpiType.SUMMARY &&
          <KpiContentWithLoading isLoading={kpiService.isPromised} />
        }

        {!kpiService.error && pageState.kpiType.value === KpiType.SERIES &&
          <KpiSeriesContentWithLoading isLoading={kpiService.isPromised} />
        }
      </div>
    </PageFormat>
  )
}

export default KpiPage;