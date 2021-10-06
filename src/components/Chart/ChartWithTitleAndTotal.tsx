import { ApexOptions } from 'apexcharts';
import { HTMLProps, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ChartWithTitleAndTotalProps } from './ChartWithTitleAndTotalProps';
import './ChartWithTitleAndTotal.scss';
import ChartIcon from '../../icons/ChartIcon';

function getDefaultOptions(labels: string[]) {
  return {
    xaxis: {
      // categories: labels
      type: 'datetime',
    },
    yaxis: {
      tickAmount: 3,
      axisBorder: {
        show: true
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
    // dataLabels: {
    //   enabled: true,
    //   textAnchor: 'start',
    //   style: {
    //     colors: ['#333']
    //   },
    //   formatter: function (val) {
    //     if (val == null) {
    //       return 'No Data';
    //     }
    //
    //     return val;
    //   }
    // },
    noData: {
      text: 'No Data',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0
    }
  } as ApexOptions;
}

function ChartWithTitleAndTotal({ title, total, series, options, labels, calculateAverage, hideTotal, className, ...props }: ChartWithTitleAndTotalProps & HTMLProps<HTMLDivElement>) {
  // const total = series.data.reduce<number>((prev, curr) => {
  //   const currVal = curr ?? 0;
  //   return prev + currVal;
  // }, 0);

  const chartOptions = useMemo(() => {
    return getDefaultOptions(labels ?? []);
  }, [labels]);

  return (
    <div className={`chart-with-total${className ? ' ' + className : ''}`} {...props}>
      <div className="chart-with-total__total">
        <h5 className="chart-with-total__title">{title}</h5>
        {!hideTotal && series.data.length > 0 &&
          <>
            <span><ChartIcon size={1} /></span>
            <span className="chart-with-total__total">{calculateAverage ? (total / series.data.length).toFixed(2) : total}</span>
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
