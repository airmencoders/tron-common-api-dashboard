import { ApexOptions } from 'apexcharts';
import { HTMLProps } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ChartWithTitleAndTotalProps } from './ChartWithTitleAndTotalProps';
import './ChartWithTitleAndTotal.scss';
import ChartIcon from '../../icons/ChartIcon';
import {setSignificantDigits} from '../../utils/number-utils';

function getDefaultOptions() {
  return {
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tickAmount: 3,
      axisBorder: {
        show: true
      },
      labels: {
        formatter(val: number, opts?: any): string {
          return setSignificantDigits(val, 2).toString(10);
        }
      }
    },
    markers: {
      strokeColors: '#3262e8',
      colors: ['#fff'],
      fillOpacity: 1,
      size: 5
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false
      }
    },
    stroke: {
      width: 2
    },
    noData: {
      text: 'No Data',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0
    }
  } as ApexOptions;
}

function ChartWithTitleAndTotal({ title, total, series, options, calculateAverage, hideTotal, className, ...props }: ChartWithTitleAndTotalProps & HTMLProps<HTMLDivElement>) {

  const chartOptions = getDefaultOptions();

  return (
    <div className={`chart-with-total${className ? ' ' + className : ''}`} {...props}>
      <div className="chart-with-total__total">
        <h5 className="chart-with-total__title">{title}</h5>
        {!hideTotal && series.data.length > 0 &&
          <>
            <span><ChartIcon size={1} /></span>
            <span className="chart-with-total__total">
              { setSignificantDigits(total, 2) }
            </span>
          </>
        }
      </div>
      <div className="chart-with-total__chart-container">
        <ReactApexChart
          options={options ?? chartOptions}
          series={[series]}
          type="line"
          className="chart-container__chart"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

export default ChartWithTitleAndTotal;
