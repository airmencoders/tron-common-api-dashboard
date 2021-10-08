import {KpiType} from './kpi-type';
import {CancelTokenSource} from 'axios';
import {createState, useState} from '@hookstate/core';

export interface KpiPageState {
  kpiType?: KpiType;
  cancelTokenSource?: CancelTokenSource;
  selectedTab?: string;
  startDate: string;
  endDate: string;
}

const kpiPageState = createState<KpiPageState>({
  kpiType: KpiType.SERIES,
  cancelTokenSource: undefined,
  selectedTab: undefined,
  startDate: '',
  endDate: '',
});

export const useKpiPageState = () => useState(kpiPageState);
