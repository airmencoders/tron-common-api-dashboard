
import { ICellRendererParams } from 'ag-grid-community';
import DownloadIcon from '../../icons/DownloadIcon';
import { AppEndpointClientInfoDto, AppSourceDetailsDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import Button from '../Button/Button';
import DownloadFile from '../../utils/download-file-util';
import './ApiSpecCellRenderer.scss';
import { ApiSpecCellRendererProps } from './ApiSpecCellRendererProps';

function ApiSpecCellRenderer(props: Partial<ICellRendererParams> & ApiSpecCellRendererProps) {
  const state = useAppSourceState();

  const download = (data: AppSourceDetailsDto | AppEndpointClientInfoDto) => {
    let name: string;
    let byEndpoint = false;
    if('name' in data) {
      name = data.name;
    } else {
      name = data.appSourceName!;
      byEndpoint = true;
    }
    DownloadFile(name, byEndpoint, byEndpoint ? state.fetchAPISpecFileByEndpointId(data.id!) : state.fetchAPISpecFile(data.id!));
  }

  const showAsText = props.showAsText && props.value;

  return (
    <div className="api-spec-cell-renderer">
        <Button type="button" onClick={() => download(props.data)} unstyled className="api-spec-cell-renderer__btn no-bg-button" disableMobileFullWidth data-testid="api-spec-btn-cell-renderer">
          <DownloadIcon iconTitle={'api-spec-download'} size={showAsText ? 1 : 1.25} />
        </Button>
      {(showAsText) ? <a data-testid="api-spec-link-cell-renderer" onClick={() => download(props.data)}>{" "+ props.value}</a> : ''}
    </div>
  );
}

export default ApiSpecCellRenderer;
