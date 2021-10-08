import React from 'react';
import {KpiMiniChartProps} from './KpiMiniChartProps';
import MiniChart from '../MiniChart/MiniChart';
import {extent, max} from 'd3-array';
import {MiniChartProps} from '../MiniChart/MiniChartProps';
import KpiMiniDataValues from './kpi-mini-data-values';
import KpiMiniData from './kpi-mini-data';
import {scaleLinear, scaleUtc} from '@visx/scale';

const topPaddingPercent = .04;

function KpiMiniChart(props: KpiMiniChartProps) {
  const yScaleCreate = (chartProps: MiniChartProps<KpiMiniData, KpiMiniDataValues>, height: number) => scaleLinear({
    range: [height, 0],
    domain: [0, max(chartProps.data, (d) => {
      if (chartProps.yAccessors == null) {
        return 0;
      }
      const yAccessorValues = Object.values(chartProps.yAccessors);
      if (yAccessorValues == null) {
        return 0;
      }
      const values: number[] = yAccessorValues.map(yAccessor => yAccessor(d) as number);
      const maxValue = Math.max(...values);
      return maxValue + maxValue * topPaddingPercent;
    }) as number]
  });


  const xScaleCreate = (chartProps: MiniChartProps<KpiMiniData, KpiMiniDataValues>) => scaleUtc({
    range: [0, chartProps.width],
    domain: extent(chartProps.data, chartProps.xAccessor) as [Date, Date]
  });

  const xAccessor = (data: KpiMiniData) => data.date;

  const yAccessors = {
    primaryValue: (data: KpiMiniData) => data.primaryValue ?? 0,
    comparisonValue: (data: KpiMiniData) => data.comparisonValue ?? 0,
  }


  const seriesColors = {
    primaryValue: '#3262E8',
    comparisonValue: 'rgba(176, 176, 176, 0.5)'
  }

  const seriesLabelColors = {
    primaryValue: '#3262E8',
    comparisonValue: '#999'
  }

  return (
      <div className="kpi-mini-chart"
           onClick={() => props.onSelected(props.title)}
      >
        <MiniChart
            seriesOrder={['primaryValue']}
            diffValue={undefined}
            isActive={props.isActive}
            aggregateValues={props.aggregateValues}
            title={props.title}
            width={220}
            height={160}
            data={props.data}
            xAccessor={xAccessor}
            yAccessors={yAccessors}
            seriesColors={seriesColors}
            seriesLabelColors={seriesLabelColors}
            yScaleCreate={yScaleCreate}
            xScaleCreate={xScaleCreate} />
      </div>
  );
}

export default KpiMiniChart;
