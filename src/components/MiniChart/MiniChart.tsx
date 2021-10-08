import React, {useMemo} from 'react';
import {MiniChartProps} from './MiniChartProps';
import {LinePath} from '@visx/shape';
import {Group} from '@visx/group';
import './MiniChart.scss';
import {setSignificantDigits} from '../../utils/number-utils';

const headerHeight = 100;
const minChartHeight = 20;

function MiniChart(props: MiniChartProps<any, any>) {

  const chartHeight = useMemo(() => {
    return props.height > headerHeight + minChartHeight ? props.height - headerHeight : props.height / 2;
  }, [props.height]);
  const yScale = useMemo(() => props.yScaleCreate(props, chartHeight), [props, chartHeight]);

  const xScale = useMemo(() => props.xScaleCreate(props), [props]);

  const yAccessorKeys = props.seriesOrder;
  const reversedYAccessorKeys = [...props.seriesOrder].reverse();
  return (
      <div className={`mini-chart ${props.isActive ? 'mini-chart--active' : ''}`}
           style={{height: props.height, width: props.width}}
      >
        <div className="mini-chart__header"
             style={{height: `${headerHeight}px`, width: `${props.width}px`}}
        >
          <div className="header__top">
            <div className="header__title">
              { props.title }
            </div>
            {
              props.diffValue &&
              <div className="header__diff-value">
              <span className="diff-value__text">
                { props.diffValue }
              </span>
              </div>
            }
          </div>
          <div className="header__value">
            {
              yAccessorKeys.map((yKey, i) => (
                  <span key={yKey}>
                    <span style={{color: props.seriesLabelColors[yKey]}}>{
                      props.aggregateValues[yKey] != null ? setSignificantDigits(props.aggregateValues[yKey], 2) : 'NA'}</span>
                    {
                      i < yAccessorKeys.length - 1 &&
                      <span className="header__value-separator"> | </span>
                    }
                  </span>
              ))
            }
          </div>
        </div>
        <div className="mini-chart__chart"
             style={{
               marginTop: `${props.height - chartHeight}px`
             }}
        >
          <svg width={props.width} height={chartHeight}>
            <Group>
              {
                reversedYAccessorKeys.map(yAccessorKey => (
                    <LinePath
                        key={yAccessorKey}
                        x={d => xScale(props.xAccessor(d)) as number}
                        y={d => yScale(props.yAccessors[yAccessorKey](d)) as number}
                        data={props.data}
                        stroke={props.seriesColors[yAccessorKey]}
                        strokeWidth={2}
                    />
                ))
              }

            </Group>
          </svg>
        </div>
      </div>
  );
}

export default MiniChart;
