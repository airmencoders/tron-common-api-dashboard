import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { createState, State, StateMethodsDestroy, useState } from '@hookstate/core';
import ScratchStorageUserAddForm from '../ScratchStorageUserAddForm';
import { ScratchStorageCreateUpdateState, ScratchStorageEditorState } from '../ScratchStorageEditForm';
import { ScratchStorageEntryDto } from '../../../openapi/models/scratch-storage-entry-dto';
import { PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../../openapi';
import { ScratchStorageFlat } from '../../../state/scratch-storage/scratch-storage-flat';
import ScratchStorageKeyValueEditorForm from '../ScratchStorageKeyValueEditorForm';
import { Initial } from '@hookstate/initial';
import { Validation } from '@hookstate/validation';
import { useScratchStorageState } from '../../../state/scratch-storage/scratch-storage-state';
import ScratchStorageService from '../../../state/scratch-storage/scratch-storage-service';
import { AxiosResponse } from 'axios';

jest.mock('../../../state/scratch-storage/scratch-storage-state');

describe('Test Scratch Storage Key Value Editor Form', () => {
    let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
    let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
    let scratchStorageKeysToCreateUpdateState : State<ScratchStorageEntryDto[]> & StateMethodsDestroy;
    let scratchStorageKeysToDeleteState : State<string[]> & StateMethodsDestroy;
    let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
    let valueState : State<string> & StateMethodsDestroy;
    let createEditState : State<ScratchStorageCreateUpdateState> & StateMethodsDestroy;
    let scratchStorageApi: ScratchStorageControllerApiInterface;
 
    beforeEach(() => {
        scratchStorageKeysToCreateUpdateState = createState<ScratchStorageEntryDto[]>([{
            appId: 'some other id',
            key: 'other-key',
            value: 'some other value',
        }]);

        scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
        selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);
        privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
        scratchStorageKeysToDeleteState = createState<string[]>(new Array<string>());
        scratchStorageApi = new ScratchStorageControllerApi();

        valueState = createState('');
        createEditState = createState({} as ScratchStorageCreateUpdateState);
    });

    afterEach(() => {
        scratchStorageKeysToCreateUpdateState.destroy();
        scratchStorageKeysToDeleteState.destroy();
        privilegeState.destroy();
        selectedScratchStorageState.destroy();
        scratchStorageState.destroy();
        valueState.destroy();
        createEditState.destroy();
    });

    it('Reads Existing key value from API', async () => {
        createEditState.set({
            isEdit: true, 
            isOpen: true,
            keyName: 'some-key', 
            appId: 'some id',        
        });

        createEditState.attach(Initial);
        createEditState.attach(Validation);

        function mockScratchStorageState() {
            (useScratchStorageState as jest.Mock)
            .mockReturnValue(
              new ScratchStorageService(scratchStorageState, 
                selectedScratchStorageState, 
                scratchStorageApi, 
                privilegeState,
                scratchStorageKeysToCreateUpdateState,
                scratchStorageKeysToDeleteState));
                
            useScratchStorageState().createUpdateState = scratchStorageKeysToCreateUpdateState;
            jest.spyOn(useScratchStorageState(), 'isPromised', 'get').mockReturnValue(true);
          }
      
        mockScratchStorageState();

        scratchStorageApi.getKeyValueByKeyName = jest.fn(() =>
            { return new Promise<AxiosResponse<ScratchStorageEntryDto>>(resolve => resolve({
                data: { appId: 'some id', key: 'some-key', value: 'some value'},
                status: 200,
                headers: {},
                config: {},
                statusText: 'OK'
            }))}
        );
        
        const page = render(
            <ScratchStorageKeyValueEditorForm
                createUpdateState={createEditState}
                valueState={valueState}
                onSubmit={() => {}}
            />
        );

        await waitFor(() => expect(page.getByTestId('scratch-storage-add-kvp-form'))
            .toBeInTheDocument());

        await waitFor(() => expect(page.getByTestId('scratch-kvp-keyname'))
            .toHaveDisplayValue('some-key'));

        await waitFor(() => expect(page.getByTestId('scratch-kvp-value'))
            .toHaveDisplayValue('some value'));

    });

    it('Creates new key form', async () => {
        createEditState.set({
            isEdit: false, 
            isOpen: true,
            keyName: '', 
            appId: 'some id',        
        });

        createEditState.attach(Initial);
        createEditState.attach(Validation);

        function mockScratchStorageState() {
            (useScratchStorageState as jest.Mock)
            .mockReturnValue(
              new ScratchStorageService(scratchStorageState, 
                selectedScratchStorageState, 
                scratchStorageApi, 
                privilegeState,
                scratchStorageKeysToCreateUpdateState,
                scratchStorageKeysToDeleteState));
                
            useScratchStorageState().createUpdateState = scratchStorageKeysToCreateUpdateState;
            jest.spyOn(useScratchStorageState(), 'isPromised', 'get').mockReturnValue(true);
          }
      
          mockScratchStorageState();
        
        const page = render(
            <ScratchStorageKeyValueEditorForm
                createUpdateState={createEditState}
                valueState={valueState}
                onSubmit={() => {}}
            />
        );

        await waitFor(() => expect(page.getByTestId('scratch-storage-add-kvp-form'))
            .toBeInTheDocument());

        await waitFor(() => expect(page.getByTestId('scratch-kvp-keyname'))
            .toHaveDisplayValue(''));

        await waitFor(() => expect(page.getByTestId('scratch-kvp-value'))
            .toHaveDisplayValue(''));
    });

    it('Edits a non-committed key', async () => {
        createEditState.set({
            isEdit: true, 
            isOpen: true,
            keyName: 'other-key', 
            appId: 'some id',        
        });

        createEditState.attach(Initial);
        createEditState.attach(Validation);

        function mockScratchStorageState() {
            (useScratchStorageState as jest.Mock)
            .mockReturnValue(
              new ScratchStorageService(scratchStorageState, 
                selectedScratchStorageState, 
                scratchStorageApi, 
                privilegeState,
                scratchStorageKeysToCreateUpdateState,
                scratchStorageKeysToDeleteState));
                
            useScratchStorageState().createUpdateState = scratchStorageKeysToCreateUpdateState;
            jest.spyOn(useScratchStorageState(), 'isPromised', 'get').mockReturnValue(true);
          }
      
          mockScratchStorageState();
        
        const page = render(
            <ScratchStorageKeyValueEditorForm
                createUpdateState={createEditState}
                valueState={valueState}
                onSubmit={() => {}}
            />
        );

        await waitFor(() => expect(page.getByTestId('scratch-storage-add-kvp-form'))
            .toBeInTheDocument());

        await waitFor(() => expect(page.getByTestId('scratch-kvp-keyname'))
            .toHaveDisplayValue('other-key'));

        await waitFor(() => expect(page.getByTestId('scratch-kvp-value'))
            .toHaveDisplayValue('some other value'));
    });
});
