import React, { useEffect } from 'react';
import { Person, PersonControllerApi } from '../openapi/index';
import { PersonContext } from './PersonProviderContext';

const personController = new PersonControllerApi();
export function UserProvider({ children } : any) {
    const [ users, setUsers ] = React.useState<Person[]>([]);
    
    useEffect(() => {
        const initialFetch = async() => setUsers(await personController.getPersons());
        initialFetch();
    }, []);

    const addUser = async (person : Person) => {
        await personController.createPerson({ person });
        setUsers(await personController.getPersons());
    }

    const editUser = async (person : Person) => {
        await personController.updatePerson({ id: person.id as string, person });
        setUsers(await personController.getPersons());
    }

    const deleteUser = async (id : string) => {
        await personController.deletePerson({ id });
        setUsers(await personController.getPersons());
    }

    const userMgmtObj = { users, addUser, editUser };  
    return (
        <PersonContext.Provider value={userMgmtObj}>
            {children}
        </PersonContext.Provider>
    )
}