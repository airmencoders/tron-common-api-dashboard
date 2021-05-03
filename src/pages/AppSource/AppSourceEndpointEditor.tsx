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
import Form from '../../components/forms/Form/Form';
import { CheckboxStatusType } from '../../components/forms/Checkbox/checkbox-status-type';

function AppSourceEndpointEditor(props: AppSourceEndpointEditorProps) {
  const appSourceService = useAppSourceState();
  const appClients = useHookstate<AppSourceClientPrivilege[]>([]);

  useEffect(() => {
    const filterResults = appSourceService.fetchAppClients()
      .then(clients => {
        // Find all privileges belonging to the selected endpoints
        const endpointClientPrivileges = props.appClientPrivileges.get().filter(clientPriv => props.selectedEndpoints.get().some(endpoint => endpoint.id === clientPriv.appEndpoint));

        // Convert object to keep track of app clients that are authorized.
        // Set the already authorized apps
        // Filter out the app source from the app clients - can't assign permissions to self
        const appClientPrivileges = clients.map(client => {
          /**
           * Check if this client has privilege to every selected endpoint.
           * If not, the authorized status for this client should be indeterminate.
           */
          let authorizedClientCount = 0;
          for (const priv of endpointClientPrivileges) {
            if (priv.appClientUser === client.id) {
              authorizedClientCount++;
            }

            if (authorizedClientCount === props.selectedEndpoints.length) {
              break;
            }
          }

          let authorized: CheckboxStatusType = CheckboxStatusType.INDETERMINATE;
          if (authorizedClientCount === props.selectedEndpoints.length) {
            authorized = CheckboxStatusType.CHECKED;
          } else if (authorizedClientCount === 0) {
            authorized = CheckboxStatusType.UNCHECKED;
          }

          return {
            id: client.id,
            name: client.name,
            authorized
          } as AppSourceClientPrivilege;
        }).filter(client => client.id !== props.appSourceId.get());

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
      cellRendererParams: { onChange: onCheckboxChange, idPrefix: 'app-source-client-authorization' },
      showTooltip: false
    })
  ];

  function onCheckboxChange(data: AppSourceClientPrivilege, event: ChangeEvent<HTMLInputElement>) {
    const selectedAppEndpoints = props.selectedEndpoints.get();
    if (selectedAppEndpoints) {
      if (event.target.checked) {
        /**
         * Find all privileges belonging to this client
         */
        const privilegesBelongingToAppClient = props.appClientPrivileges.get().filter(privilege => privilege.appClientUser === data.id);

        /**
         * For each endpoint, add the App Client as a privileged user
         */
        selectedAppEndpoints.forEach(endpoint => {
          if (endpoint.id) {
            const appClientUserPrivDto: AppClientUserPrivDto = {
              appClientUser: data.id,
              appClientUserName: data.name,
              appEndpoint: endpoint.id
            };

            /**
             * Ensure the App Client doesn't already have an existing privilege for the endpoint
             * to avoid adding them multiple times to the same endpoint.
             */
            if (privilegesBelongingToAppClient.find(privilege => privilege.appEndpoint === endpoint.id) == null)
              props.appClientPrivileges[props.appClientPrivileges.length].set(appClientUserPrivDto);
          }
        });
      } else {
        selectedAppEndpoints.forEach(endpoint => {
          props.appClientPrivileges.find(client => client.appClientUser.get() === data.id && client.appEndpoint.get() === endpoint.id)?.set(none);
        })
      }
    }

    // Sets local state of App Clients
    appClients.find(client => client.id.get() === data.id)?.authorized.set(event.target.checked ? CheckboxStatusType.CHECKED : CheckboxStatusType.UNCHECKED);
  }

  if (appClients.promised) {
    return <Spinner centered />;
  }

  const endpoints = props.selectedEndpoints.get();

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
            value={endpoints.length === 1 ? endpoints[0].path : `${endpoints[0].path}...(and ${endpoints.length - 1} others)`}
            disabled={true}
          />
        </FormGroup>

        {endpoints.length === 1 &&
          <FormGroup
            labelName="endpoint-method"
            labelText="Endpoint Method"
          >
            <TextInput
              id="endpoint-method"
              name="endpoint-method"
              type="text"
            value={endpoints[0].requestType}
              disabled={true}
            />
          </FormGroup>
        }

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
      </Form>
    </div>
  )
}

export default AppSourceEndpointEditor;