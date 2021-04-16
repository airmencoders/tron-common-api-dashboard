import { ApexOptions } from "apexcharts";
import { CountMetricDto } from "../../../openapi";

export const translateData = (countMetrics: CountMetricDto[] | undefined): {name: string; data: number[]}[] => {
    let data = countMetrics?.map(item => item.sum ?? 0) ?? [];
    if(data.every(item => item === 0)) {
        data = [];
    }
    return [{
        name: 'Requests',
        data: data
    }]
}

export const translateOptions = (countMetrics: CountMetricDto[] | undefined, type: string, selectFunction?: (config: any) => void): ApexOptions => {
    const categories = countMetrics?.map(item => item.path).filter(item => item != null) ?? [];
    const opts = JSON.parse(JSON.stringify(barChartDefaultOptions)) as ApexOptions;
    opts.xaxis = {
      categories: categories
    }
    if(selectFunction) {
        opts.chart = {
            ... opts.chart,
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    selectFunction(config);
                }
            }
        }
    }
    opts.title!.text = type === 'endpoint' ? 'Requests By Endpoint in the last 30 days' : 'Requests By App Client in the last 30 days';
    return opts;
}

export const findChartHeight = (options: ApexOptions): string => {
    if(!options || !options.xaxis) {
        return '50%'
    }
    return (options.xaxis.categories.length * 5) + 25 > 100 ? '100%' : (options.xaxis.categories.length / 5) + 25 + '%'
}

const barChartDefaultOptions: ApexOptions =  {
    chart: {
      id: 'metric-bar-chart',
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%"
          },
          legend: {
            show: false
          }
        }
      }
    ],
    title: {
      text: 'Requests',
      align: 'center'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
        barHeight: '50%',
        dataLabels: {
          
        },
      },
    },
    theme: {
      palette: 'palette1'
    },
    xaxis: {
        categories: []
    },
    noData: {
      text: 'No Requests have been made in the last 30 days',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined
      }
    }
  };