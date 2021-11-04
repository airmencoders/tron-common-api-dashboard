import { render } from '@testing-library/react';
import axios from 'axios';
import { openapiAxiosInstance } from '../../../api/openapi-axios';
import ApiSpecCellRenderer from '../ApiSpecCellRenderer';

jest.mock('../../../api/openapi-axios');
describe('API Spec Cell Renderer', () => {
  beforeAll(() => {
    (openapiAxiosInstance as unknown as jest.Mock).mockReturnValue(axios.create());
  });

  it('Renders correctly', async () => {
    const page = render(
      <ApiSpecCellRenderer showAsText={false}/>
    );

    expect(page.getByTestId('api-spec-btn-cell-renderer')).toBeTruthy();
  });

  it('Show text when property is set', async () => {
    const page = render(
      <ApiSpecCellRenderer showAsText={true} value={'test-value'} data={{appSourceName: ''}}/>
    );

    expect(page.queryByText('test-value')).toBeInTheDocument();
  });

  it('Do not show text when property is set', async () => {
    const page = render(
      <ApiSpecCellRenderer showAsText={false} value={'test-value'} data={{name: ''}}/>
    );

    expect(page.queryByText('test-value')).not.toBeInTheDocument();
  });
});

