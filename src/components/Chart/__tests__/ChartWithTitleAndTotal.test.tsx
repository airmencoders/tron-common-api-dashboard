import { render } from '@testing-library/react';
import { ApexOptions } from 'apexcharts';
import { MemoryRouter } from 'react-router-dom';
import ChartWithTitleAndTotal from '../ChartWithTitleAndTotal';

jest.mock('react-apexcharts', () => {
  return {
    __esModule: true,
    default: (props: {
      options: ApexOptions;
      series: { name: string; data: number[] }[];
      type: string;
      height: string;
      width: string
    }) => {
      return <div>Chart</div>;
    },
  }
});
describe('Test Chart With Title and total', () => {
  it('should render correctly', () => {
    const page = render(
      <MemoryRouter>
        <ChartWithTitleAndTotal
          title="Chart With Title and Total"
          series={{
            data: [10, 10, undefined]
          }}
          labels={[]}
          className="chart-classname"
          total={20}/>
      </MemoryRouter>
    );

    expect(page.getByText(/Chart With Title and Total/i)).toBeInTheDocument();
    expect(page.getByText(/20/i)).toBeInTheDocument();
    expect(page.getByText('Chart')).toBeInTheDocument();
  });

  it('should hide total', () => {
    const page = render(
      <MemoryRouter>
        <ChartWithTitleAndTotal
          title="Chart With Title and Total"
          series={{
            data: [10, 10]
          }}
          labels={[]}
          hideTotal
          total={20}/>
      </MemoryRouter>
    );

    expect(page.getByText(/Chart With Title and Total/i)).toBeInTheDocument();
    expect(page.queryByText(/20/i)).not.toBeInTheDocument();
    expect(page.getByText('Chart')).toBeInTheDocument();
  });

  it('should calculate average instead of total', () => {
    const page = render(
      <MemoryRouter>
        <ChartWithTitleAndTotal
          title="Chart With Title and Total"
          series={{
            data: [10, 10]
          }}
          labels={[]}
          total={10}
        />
      </MemoryRouter>
    );

    expect(page.getByText(/Chart With Title and Total/i)).toBeInTheDocument();
    expect(page.queryByText(/10/i)).toBeInTheDocument();
    expect(page.getByText('Chart')).toBeInTheDocument();
  });
})
