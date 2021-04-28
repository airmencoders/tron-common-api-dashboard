import React, { ChangeEvent, useEffect } from 'react';
import { none, useHookstate } from '@hookstate/core';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import { AppClientUserPrivDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import { AppSourceEndpointEditorProps } from './AppSourceEndpointEditorProps';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import GridColumn from '../../components/Grid/GridColumn';
import './AppSourceEndpointEditor.scss';
import TextInput from '../../components/forms/TextInput/TextInput';
import Spinner from '../../components/Spinner/Spinner';
import CheckboxCellRenderer from '../../components/CheckboxCellRenderer/CheckboxCellRenderer';
import { AppSourceClientPrivilege } from '../../state/app-source/app-source-client-privilege';

function AppSourceEndpointEditor(props: AppSourceEndpointEditorProps) {
  const appSourceService = useAppSourceState();
  const appClients = useHookstate<AppSourceClientPrivilege[]>([]);

  useEffect(() => {
    const filterResults = appSourceService.fetchAppClients()
      .then(clients => {
        // Find all privileges belonging to this endpoint
        const endpointClientPrivileges = props.appClientPrivileges.get().filter(clientPriv => clientPriv.appEndpoint === props.endpoint.get().id);

        // Convert object to keep track of app clients that are authorized.
        // Set the already authorized apps
        const appClientPrivileges = clients.map(client => {
          return {
            id: client.id,
            name: client.name,
            authorized: endpointClientPrivileges.find(clientPriv => clientPriv.appClientUser === client.id) ? true : false
          } as AppSourceClientPrivilege;
        });

        return appClientPrivileges;
      });

    appClients.set(filterResults);
  }, []);

  const appClientUserPrivColumns: GridColumn[] = [
    new GridColumn({
      field: 'name',
      sortable: true,
      filter: true,
      headerName: 'App Client Name',
      resizable: true
    }),
    new GridColumn({
      field: 'authorized',
      headerName: 'Authorized',
      headerClass: 'header-center',
      cellRenderer: CheckboxCellRenderer,
      cellRendererParams: { onChange: onChange, idPrefix: 'app-source-client-authorization' }
    })
  ];

  function onChange(data: AppSourceClientPrivilege, event: ChangeEvent<HTMLInputElement>) {
    const appEndpoint = props.endpoint.id.get();
    if (appEndpoint) {
      if (event.target.checked) {

        const appClientUserPrivDto: AppClientUserPrivDto = {
          appClientUser: data.id,
          appClientUserName: data.name,
          appEndpoint
        };

        props.appClientPrivileges[props.appClientPrivileges.length].set(appClientUserPrivDto);
      } else {
        props.appClientPrivileges.find(client => client.appClientUser.get() === data.id && client.appEndpoint.get() === appEndpoint)?.set(none)
      }
    }

    appClients.find(client => client.id.get() === data.id)?.authorized.set(event.target.checked);
  }

  if (appClients.promised) {
    return <Spinner centered />;
  }

  return (
    <div className="endpoint-editor" data-testid="app-source-endpoint-editor">
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
        labelName="appClientList"
        labelText="App Clients"
        >
        </FormGroup>

        <ItemChooser
          columns={appClientUserPrivColumns}
        items={appClients.get()}
          onRowClicked={() => { return; }}
      />
    </div>
  )
}

export default AppSourceEndpointEditor;