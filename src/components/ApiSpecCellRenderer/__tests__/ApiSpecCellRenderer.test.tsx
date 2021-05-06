import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render } from '@testing-library/react';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto } from '../../../openapi';
import ApiSpecCellRenderer from '../ApiSpecCellRenderer';
import DownloadFile from '../DownloadFile';

jest.mock('axios');
describe('API Spec Cell Renderer', () => {
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

