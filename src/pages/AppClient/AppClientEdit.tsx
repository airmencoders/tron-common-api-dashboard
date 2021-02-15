import React from 'react';
import { useState } from "@hookstate/core";
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import AppClientForm from './AppClientForm';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { AppClientFormError } from './AppClientFormError';
import { AppClientFormActionType } from './AppClientFormActionType';
import { AppClientFormActionSuccess } from './AppClientFormActionSuccess';

function AppClientEdit(props: { client?: AppClientFlat }) {
  const appClientState = useAppClientsState();
  const isSubmitting = useState(false);

  const emptyErrorMsg = {
    validation: undefined,
    general: ""
  };
  const errorMsg = useState<AppClientFormError>(emptyErrorMsg);

  const successState = useState<AppClientFormActionSuccess>({
    success: false,
    successMsg: ""
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) {
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

      successState.set({
        success: true,
        successMsg: "Successfully edited App Client"
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

  return (
    <AppClientForm client={props.client} onSubmit={onSubmit} isSubmitting={isSubmitting.get()} type={AppClientFormActionType.UPDATE} successAction={successState.get()} />
  );
}

export default AppClientEdit;