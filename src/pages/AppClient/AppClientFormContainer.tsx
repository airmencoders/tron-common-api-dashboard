import React from 'react';
import AppClientForm from './AppClientForm';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { useState } from '@hookstate/core';
import { AppClientFormError } from './AppClientFormError';
import { AppClientFormActionType } from './AppClientFormActionType';

function AppClientFormContainer(props: { client?: AppClientFlat, type: AppClientFormActionType }) {
  const appClientState = useAppClientsState();
  const isSubmitting = useState(false);

  const emptyErrorMsg = {
    validation: undefined,
    general: ""
  };
  const errorMsg = useState<AppClientFormError>(emptyErrorMsg);

  async function onUpdateSubmit(event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) {
    event.preventDefault();

    isSubmitting.set(true);
    errorMsg.set(emptyErrorMsg);

    try {
      const response = await appClientState.sendUpdatedAppClient(appClientState.convertToDto(client));

      appClientState.appClients?.set((prev) => {
        const clients = [...prev];

        const targetClientIdx = clients.findIndex(stateClient => client.id === stateClient.id);
        clients[targetClientIdx] = appClientState.convertAppClientToFlat(response.data);

        return clients;
      });
    } catch (err) {
      if (err.response) {
        const validation = err.response.data.errors?.reduce((prev: any, current: any) => {
          const updated = { ...prev };
          updated[current.field] = current.defaultMessage;

          return updated;
        }, {});

        errorMsg.validation.set(validation);
        errorMsg.general.set(err.response.data.message);
      } else if (err.request) {
        errorMsg.general.set("Error contacting server. Try again later.");
      } else {
        errorMsg.general.set("Internal error occurred. Try again later.");
      }
    } finally {
      isSubmitting.set(false);
    }
  }

  async function onAddSubmit(event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) {
    event.preventDefault();

    isSubmitting.set(true);
    errorMsg.set(emptyErrorMsg);

    try {
      const response = await appClientState.sendCreateAppClient(appClientState.convertToDto(client));

      appClientState.appClients?.set((prev) => {
        const clients = [...prev];
        clients[clients.length] = appClientState.convertAppClientToFlat(response.data);

        return clients;
      });
    } catch (err) {
      if (err.response) {
        const validation = err.response.data.errors?.reduce((prev: any, current: any) => {
          const updated = { ...prev };
          updated[current.field] = current.defaultMessage;

          return updated;
        }, {});

        errorMsg.validation.set(validation);
        errorMsg.general.set(err.response.data.message);
      } else if (err.request) {
        errorMsg.general.set("Error contacting server. Try again later.");
      } else {
        errorMsg.general.set("Internal error occurred. Try again later.");
      }
    } finally {
      isSubmitting.set(false);
    }
  }

  function getSubmitAction() {
    if (props.type === AppClientFormActionType.ADD)
      return onAddSubmit;
    else
      return onUpdateSubmit;
  }

  return (
    <AppClientForm client={props.client} onSubmit={getSubmitAction()} errors={errorMsg.value} type={props.type} isSubmitting={isSubmitting.value} />
  );
}

export default AppClientFormContainer;
