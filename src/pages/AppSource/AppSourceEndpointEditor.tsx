import { Downgraded, none, useHookstate } from '@hookstate/core';
import { useEffect } from 'react';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import { AppClientSummaryDto, AppClientUserPrivDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import { AppSourceEndpointEditorProps } from './AppSourceEndpointEditorProps';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import GridColumn from '../../components/Grid/GridColumn';
import { RowClickedEvent } from 'ag-grid-community';
import Button from '../../components/Button/Button';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import './AppSourceEndpointEditor.scss';
import TextInput from '../../components/forms/TextInput/TextInput';
import Spinner from '../../components/Spinner/Spinner';

interface AppClient {
  id: string;
  name: string;
}

function AppSourceEndpointEditor(props: AppSourceEndpointEditorProps) {
  const appSourceService = useAppSourceState();
  const availableAppClients = useHookstate<AppClientSummaryDto[]>([]);
  const selectedAppClient = useHookstate<AppClient | undefined>(undefined);

  useEffect(() => {
    const filterResults = appSourceService.fetchAppClients()
      .then(clients => {
        // Find all privileges belonging to this endpoint
        const endpointClientPrivileges = props.appClientPrivileges.get().filter(clientPriv => clientPriv.appEndpoint === props.endpoint.get().id);

        // Filter out all of the clients that already have an existing privilege for this endpoint
        return clients.filter(client => !endpointClientPrivileges.find(clientPriv => clientPriv.appClientUser === client.id));
      });

    availableAppClients.set(filterResults);
  }, []);

  const deleteBtnName = 'Delete';
  const appClientUserPrivColumns: GridColumn[] = [
    new GridColumn({
      field: 'appClientUserName',
      sortable: true,
      filter: true,
      headerName: 'App Client Name',
      resizable: true
    }),
    new GridColumn({
      headerName: deleteBtnName,
      headerClass: 'header-center',
      cellRenderer: DeleteCellRenderer,
      cellRendererParams: { onClick: deleteClientPrivilege }
    })
  ];

  const appClientSummaryColumns: GridColumn[] = [
    new GridColumn({
      field: 'name',
      sortable: true,
      filter: true,
      headerName: 'App Client Name',
      resizable: true
    })
  ];

  function deleteClientPrivilege(deleteItem: AppClientUserPrivDto) {
    // Add client back to available clients
    availableAppClients[availableAppClients.length].set({
      id: deleteItem.appClientUser,
      name: deleteItem.appClientUserName
    });

    // Remove from formState
    props.appClientPrivileges.find(client => client.appClientUser.get() === deleteItem.appClientUser)?.set(none);
  }

  function onAdd() {
    const appClientId = selectedAppClient.get()?.id;
    const appClientName = selectedAppClient.get()?.name;
    const appEndpoint = props.endpoint.id.get();

    if (appClientId && appEndpoint) {
      const appClientUserPrivDto: AppClientUserPrivDto = {
        appClientUser: appClientId,
        appClientUserName: appClientName,
        appEndpoint
      };

      // Add the privilege to formState to be added
      props.appClientPrivileges[props.appClientPrivileges.length].set(appClientUserPrivDto);

      // Remove from available app clients
      availableAppClients.find(client => client.id.get() === appClientId)?.set(none);
    }

    // reset state
    selectedAppClient.set(none);
  }

  function onAvailableAppClientClick(event: RowClickedEvent) {
    const data: AppClientSummaryDto = event.data;

    selectedAppClient.set({
      id: data.id ?? '',
      name: data.name ?? ''
    });
  }

  const currentAppClientUserPrivs = props.appClientPrivileges.attach(Downgraded).get().filter(client => {
    return client.appEndpoint === props.endpoint.get().id;
  });

  if (availableAppClients.promised) {
    return <Spinner centered />;
  }

  return (
    <div className="endpoint-editor" data-testid="app-source-endpoint-editor">
      <Form onSubmit={() => { return; }} className="endpoint-editor__form" >
        <FormGroup
          labelName="endpoint-path"
          labelText="Endpoint Path"
        >
          <TextInput
            id="endpoint-path"
            name="endpoint-path"
            type="text"
            value={props.endpoint.get().path}
            disabled={true}
          />
        </FormGroup>

        <FormGroup
          labelName="endpoint-method"
          labelText="Endpoint Method"
        >
          <TextInput
            id="endpoint-method"
            name="endpoint-method"
            type="text"
            value={props.endpoint.get().requestType}
            disabled={true}
          />
        </FormGroup>

        <FormGroup
          labelName="privilegedAppList"
          labelText="App Clients with Access"
        >
        </FormGroup>

        <ItemChooser
          columns={appClientUserPrivColumns}
          items={currentAppClientUserPrivs}
          onRowClicked={() => { return; }}
        />

        <FormGroup
          labelName="availableAppList"
          labelText="Available App Clients"
        >
        </FormGroup>

        <ItemChooser
          items={availableAppClients.promised ? [] : availableAppClients.get()}
          columns={appClientSummaryColumns}
          onRowClicked={onAvailableAppClientClick}
        />

        <Button
          type="button"
          className="endpoint-editor__add-client-btn"
          onClick={onAdd}
          disabled={selectedAppClient.promised || selectedAppClient.get() == null}
        >
          Add Client
        </Button>

      </Form>
    </div>
  )
}

export default AppSourceEndpointEditor;