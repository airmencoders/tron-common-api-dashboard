import React from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import MiniChart from '../MiniChart';
import {MiniChartProps} from '../MiniChartProps';
import {scaleLinear} from '@visx/scale';

const miniChartProps: MiniChartProps<Record<string, number>> = {
  title: 'Title',
  seriesOrder: ['series1', 'series2'],
  diffValue: '+4.2%',
  isActive: false,
  aggregateValues: {
    series1: 400,
    series2: 800
  },
  width: 200,
  height: 200,
  data: [
    { x: 0, series1: 1, series2: 3},
    { x: 2, series1: 2, series2: 2},
    { x: 3, series1: 3, series2: 1},
  ],
  xAccessor: (d) => d.x,
  yAccessors: {
    series1: d => d.series1,
    series2: d => d.series2,
  },
  seriesColors: {
    series1: '#eeeeee',
    series2: '#cccccc',
  },
  seriesLabelColors: {
    series1: '#000',
    series2: '#111',
  },
  xScaleCreate: props => scaleLinear({
    range: [0, props.width],
    domain: [0, 3]
  }),
  yScaleCreate: (props, chartHeight) => scaleLinear({
    range: [chartHeight, 0],
    domain: [0, 3]
  })
};

test ('MiniChart is shown', async () => {

  render(<MiniChart
      {...miniChartProps}
  />);
  await waitFor(
      () => expect(screen.getByText(miniChartProps.title))
          .toBeTruthy()
  )
});
