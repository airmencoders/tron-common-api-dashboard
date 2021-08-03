import { ApexOptions } from 'apexcharts';
import { HTMLProps } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ChartWithTitleAndTotalProps } from './ChartWithTitleAndTotalProps';
import './ChartWithTitleAndTotal.scss';

function getDefaultOptions(labels: string[]) {
  return {
    xaxis: {
      categories: labels
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#333']
      },
      formatter: function (val) {
        if (val == null) {
          return 'No Data';
        }

        return val;
      }
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

function ChartWithTitleAndTotal({ title, series, options, labels, calculateAverage, hideTotal, className, ...props }: ChartWithTitleAndTotalProps & HTMLProps<HTMLDivElement>) {
  const total = series.data.reduce<number>((prev, curr) => {
    const currVal = curr ?? 0;
    return prev + currVal;
  }, 0);

  return (
    <div className={`chart-with-total${className ? ' ' + className : ''}`} {...props}>
      <div className="chart-with-total__total">
        <h5>{title}</h5>
        {!hideTotal && series.data.length > 0 &&
          <h3>{calculateAverage ? (total / series.data.length).toFixed(2) : total}</h3>
        }
      </div>
      <div className="chart-with-total__chart-container">
        <ReactApexChart
          options={options ?? getDefaultOptions(labels)}
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