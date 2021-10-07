import React, {useEffect, useState} from 'react';
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
import {useKpiPageState} from './kpi-page-state';
import {
  addWeeksToDate,
  formatDateToEnCa,
  getEndOfWeek,
  getFirstDayOfWeek,
  getStartOfDay,
  parseIsoDate
} from '../../utils/date-utils';
import {KpiChartTitles} from './kpi-chart-titles';


function KpiPage() {
  const kpiService = useKpiState();
  const pageState = useKpiPageState();

  useEffect(() => {
    const startEndDate = setDefaultDateRange();
    pageState.startDate.set(startEndDate.startDate);
    pageState.endDate.set(startEndDate.endDate);
    fetchKpiSeries(startEndDate.startDate, startEndDate.endDate);
    if (pageState.selectedTab.get() == null) {
      pageState.selectedTab.set(KpiChartTitles.TOTAL_REQUESTS)
    }
    return function cleanup() {
      pageState.cancelTokenSource.value?.cancel();
      kpiService.resetState();
    }
  }, []);

  function setDefaultDateRange(): {startDate: string, endDate: string} {
    const todayIso = formatDateToEnCa(Date.now());
    const today = parseIsoDate(todayIso);
    const firstDayOfThisWeekIso = formatDateToEnCa(getFirstDayOfWeek(today, 1));
    const firstDayOfThisWeek = parseIsoDate(firstDayOfThisWeekIso);
    const startDate = addWeeksToDate(firstDayOfThisWeek, -3);
    const endDate = getStartOfDay(getEndOfWeek(firstDayOfThisWeek, 1));

    return {
      startDate: formatDateToEnCa(startDate),
      endDate: formatDateToEnCa(endDate)
    };
  }

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
