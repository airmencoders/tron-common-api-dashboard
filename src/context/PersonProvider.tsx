import React, { useEffect } from 'react';
import { PersonContext } from './PersonProviderContext';
import {Person, PersonControllerApi} from '../openapi';

const personController = new PersonControllerApi();
export function UserProvider({ children } : any) {
    const [ users, setUsers ] = React.useState<Person[]>([]);

    useEffect(() => {
        const initialFetch = async() => {
            const personsResponse = await personController.getPersons();
            setUsers(personsResponse.data);
        }
        initialFetch();
    }, []);

    const addUser = async (person : Person) => {
        await personController.createPerson(person );
        const personsResponse = await personController.getPersons();
        setUsers(personsResponse.data);
    }

    const editUser = async (person : Person) => {
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
