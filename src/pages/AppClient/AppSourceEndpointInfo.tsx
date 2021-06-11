import React, {useEffect, useMemo, useState} from 'react';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import GridColumn from '../../components/Grid/GridColumn';
import {AppSourceEndpointInfoProps} from './AppSourceEndpointInfoProps';
import {GridApi} from 'ag-grid-community';
import "swagger-ui-react/swagger-ui.css"
import {generatePath, Link} from 'react-router-dom';
import {RoutePath} from '../../routes';
import Label from '../../components/forms/Label/Label';
import './AppSourceEndpointInfo.scss';
import TestEndpointIcon from '../../icons/TestEndpointIcon';
import Button from '../../components/Button/Button';
import DownloadIcon from '../../icons/DownloadIcon';
import {AppEndpointClientInfoDto} from '../../openapi/models';
import {useAppSourceState} from '../../state/app-source/app-source-state';
import DownloadFile from '../../utils/download-file-util';

function AppSourceEndpointInfo(props: AppSourceEndpointInfoProps) {
  const appSourceState = useAppSourceState();

  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);

  const appSourceEndpointColumns: GridColumn[] = useMemo(() => [
    new GridColumn({
      field: 'path',
      sortable: true,
      filter: true,
      headerName: 'Path',
      resizable: true,
    }),
    new GridColumn({
      field: 'method',
      sortable: true,
      filter: true,
      headerName: 'Type',
      resizable: true,
      initialWidth: 100
    })
  ], []);

  const firstEndpointData: AppEndpointClientInfoDto | undefined = useMemo(() => {
    if (props.appSourceDevDetails?.allowedEndpoints?.length > 0) {
      return props.appSourceDevDetails?.allowedEndpoints[0];
    }
  }, [props.appSourceDevDetails])

  useEffect(() => {
    if (props.isOpened) {
      gridApi?.sizeColumnsToFit();
    }
  },[props.isOpened]);

  const handleGridReady = (gridApi: GridApi | undefined) => {
    setGridApi(gridApi);
  }

  const downloadSpec = () => {
    DownloadFile(props.appSourceDevDetails.name, false,
        appSourceState.fetchAPISpecFile(props.appSourceDevDetails.appSourceId))
  }

  return (
      <div className="app-source-endpoint-info">
        {
          firstEndpointData &&
          <>
            <div className="app-source-endpoint-info__section">
              <div className="app-source-endpoint-info__label">
                <Label htmlFor="app-source-path">Base Url</Label>
              </div>
              <div id="app-source-path" className="app-source-endpoint-info__path section__value">
                {firstEndpointData.basePath}
              </div>
            </div>
            <div className="app-source-endpoint-info__section">
              <div className="app-source-endpoint-info__label">
                <Label htmlFor="app-source-path">API</Label>
              </div>
              <div className="app-source-endpoint-info__value">
                <Link className="value__link" to={{
                  pathname: generatePath(RoutePath.API_TEST, {
                    apiId: props.appSourceDevDetails.appSourceId ?? ''
                  }),
                  search: `?basePath=${encodeURIComponent(firstEndpointData.basePath ?? '')}`
                }}
                      target="_blank"
                      rel="noopener noreferrer"
                >
                  <TestEndpointIcon size={1} iconTitle="Execute"/>
                  Execute
                </Link>
                <Button type="button" onClick={downloadSpec} unstyled className="value__link"
                        disableMobileFullWidth>
                  <DownloadIcon iconTitle={'api-spec-download'} size={1}/> Download
                </Button>
              </div>
            </div>
            <ItemChooser
                columns={appSourceEndpointColumns}
                items={props.appSourceDevDetails?.allowedEndpoints ?? []}
                onRowClicked={() => {
                  return;
                }}
                onGridReady={handleGridReady}
            />
          </>
        }

      </div>
  );
}

export default AppSourceEndpointInfo;
