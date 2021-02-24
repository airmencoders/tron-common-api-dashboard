import React, { useEffect } from 'react';
import { PersonContext } from './PersonProviderContext';
import {Configuration, PersonDto, PersonControllerApi} from '../openapi';
import Config from '../api/configuration';

const personController = new PersonControllerApi(new Configuration({
    basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));
export function UserProvider({ children } : any) {
    const [ users, setUsers ] = React.useState<PersonDto[]>([]);

    useEffect(() => {
        const initialFetch = async() => {
            const personsResponse = await personController.getPersons();
            setUsers(personsResponse.data);
        }
        initialFetch();
    }, []);

    const addUser = async (person : PersonDto) => {
        await personController.createPerson(person );
        const personsResponse = await personController.getPersons();
        setUsers(personsResponse.data);
    }

    const editUser = async (person : PersonDto) => {
        await personController.updatePerson(person.id as string, person);
        const personsResponse = await personController.getPersons();
        setUsers(personsResponse.data);
    }

    const deleteUser = async (id : string) => {
        await personController.deletePerson(id);
        const personsResponse = await personController.getPersons();
        setUsers(personsResponse.data);
    }

    const userMgmtObj = { users, addUser, editUser };
    return (
        <PersonContext.Provider value={undefined}>
            {children}
        </PersonContext.Provider>
    )
}
