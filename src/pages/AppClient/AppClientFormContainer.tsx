import React from 'react';
import AppClientForm from './AppClientForm';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { AppClientUserDto, Privilege } from '../../openapi';
import { accessPrivilegeState } from '../../state/privilege/privilege-state';
import { PrivilegeType } from '../../state/app-clients/interface/privilege-type';
import { PrivilegeDto } from '../../openapi/models/privilege-dto';
import { useState } from '@hookstate/core';
import axios from 'axios';
import Config from '../../api/configuration';

function AppClientFormContainer(props: { client?: AppClientFlat }) {
  const appClientState = useAppClientsState();
  const privilegeState = accessPrivilegeState();
  const isSubmitting = useState(false);
  const errorMsg = useState({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) {
    event.preventDefault();

    isSubmitting.set(true);
    try {
      // const response = (await appClientState.sendUpdatedAppClient(convertToDto(client))).data;
      const response = await axios({
        method: 'put',
        url: Config.API_BASE_URL + Config.API_PATH_PREFIX + "/" + Config.API_VERSION_PREFIX + "/" + "app-client/" + client.id,
        data: {
          id: client.id,
          name: client.name,
          privileges: createAppPrivilegesArr(client)
        }
      });

      appClientState.appClients?.set((prev) => {
        const clients = [...prev];

        const targetClientIdx = clients.findIndex(stateClient => client.id === stateClient.id);
        clients[targetClientIdx] = appClientState.convertAppClientToFlat(response.data);

        return clients;
      });
    } catch (err) {
      errorMsg.set(err.response.data);
    } finally {
      isSubmitting.set(false);
    }
  }

  function convertToDto(client: AppClientFlat): AppClientUserDto {
    return {
      id: client.id,
      name: client.name,
      privileges: createAppPrivileges(client)
    };
  }

  function createAppPrivilegesArr(client: AppClientFlat): Array<Privilege> {
    return Array.from(createAppPrivileges(client));
  }

  function createAppPrivileges(client: AppClientFlat): Set<PrivilegeDto> {
    const privileges = new Set<PrivilegeDto>();

    if (client.read) {
      const privilege = privilegeState.privileges?.value.find(priv => priv.name === PrivilegeType.READ);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (client.write) {
      const privilege = privilegeState.privileges?.value.find(priv => priv.name === PrivilegeType.WRITE);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    return privileges;
  }

  return (
    <AppClientForm client={props.client} onSubmit={onSubmit} />
  );
}

export default AppClientFormContainer;
