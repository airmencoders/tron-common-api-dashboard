import React from 'react';
import { render } from '@testing-library/react';
import KpiMiniChart from '../KpiMiniChart';

describe('Kpi Mini Chart', () => {
  it('should render the Kpi Mini Chart', async () => {
    const data = [
      { date: new Date(), primaryValue: 30 }
    ];
    const page = render(
        <KpiMiniChart
            data={data}
            aggregateValues={{primaryValue: 30}}
            isActive={false}
            title="Kpi Chart"
            onSelected={() => {}}
        />
    );
    expect(page.getByText('Kpi Chart')).toBeTruthy();
  });
});
