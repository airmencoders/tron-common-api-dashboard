import { RowClickedEvent } from 'ag-grid-community';
import React, {useEffect} from 'react';
import { Container, Spinner } from 'react-bootstrap';
import Grid from '../../components/Grid/Grid';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { StatusType } from '../../components/StatusCard/status-type';
import StatusCard from '../../components/StatusCard/StatusCard';
import Button from '../../components/Button/Button';
import {DataCrudFormPageProps} from './DataCrudFormPageProps';
import {DataService} from '../../state/data-service/data-service';
import {CrudPageState} from '../../state/crud-page/crud-page-state';
import {State} from '@hookstate/core';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {GridRowData} from '../Grid/grid-row-data';

export function DataCrudFormPage<T extends GridRowData, R> (props: DataCrudFormPageProps<T, R>) {
  const dataState: DataService<any, any> = props.useDataState();

  const pageState: State<CrudPageState<any>> = props.usePageState<T>();

  useEffect(() => {
    dataState.fetchAndStoreData();
    return () => {
      pageState.set({
        isOpen: false,
        formAction: undefined,
        selected: undefined,
        formErrors: undefined,
        successAction: undefined
      });
    }
  }, []);

  async function onRowClicked(event: RowClickedEvent): Promise<void> {

    const rowData = event.data;
    if (rowData != null) {
      const dtoData = await dataState.getDtoForRowData(rowData);
      pageState.set({
        formAction: FormActionType.UPDATE,
        isOpen: true,
        selected: dtoData,
        formErrors: undefined,
        successAction: undefined
      });
    }
  }

  function onAddClientClick() {
    pageState.set({
      formAction: FormActionType.ADD,
      isOpen: true,
      selected: undefined,
      formErrors: undefined,
      successAction: undefined
    });
  }

  function onCloseHandler() {
    pageState.set({
      formAction: undefined,
      isOpen: false,
      selected: undefined,
      formErrors: undefined,
      successAction: undefined
    });
  }

  async function updateSubmit(updatedDto: T) {
    try {
      await dataState.sendUpdate(updatedDto);
      pageState.set( prevState => {
        return {
          ...prevState,
          successAction: {
            success: true,
            successMsg: `Successfully updated ${props.dataTypeName}.`
          }
        }
      })
    }
    catch (error) {
      console.log(error);
      pageState.set(prevState => {
        return {
          ... prevState,
          formErrors: {
            general: error.message
          }
        }
      })
    }
  }

  async function createSubmit(newDto: T) {
    try {
      await dataState.sendCreate(newDto);
    }
    catch (error) {
      // set error state here
      console.log(error);
    }
  }

  const UpdateForm = props.updateForm;
  const CreateForm = props.createForm;

  return (
      <PageFormat pageTitle={props.pageTitle}>
        <Container fluid style={{ height: '100%' }}>
          {dataState.isPromised ?
              <Spinner animation="border" role="status" variant="primary">
                <span className="sr-only">Loading...</span>
              </Spinner>
              :
              <div style={{ height: '100%' }}>
                {dataState.error ?
                    <StatusCard status={StatusType.ERROR} title={props.pageTitle} />
                    :
                    <>
                      <div className="add-app-client">
                        <Button type="button" className="add-app-client__btn" onClick={onAddClientClick}>
                          Add { props.dataTypeName }
                        </Button>
                      </div>

                      <Grid
                          data={dataState.state?.get() || []}
                          columns={props.columns}
                          onRowClicked={onRowClicked}
                          rowClass="ag-grid--row-pointer"
                      />

                      <SideDrawer title={props.dataTypeName} isOpen={pageState.isOpen.get()} onCloseHandler={onCloseHandler}>
                        {pageState.selected.get() && pageState.formAction.value === FormActionType.UPDATE ?
                            <UpdateForm
                                data={pageState.selected.get()}
                                formErrors={pageState.formErrors.get()}
                                onSubmit={updateSubmit}
                                onClose={onCloseHandler}
                                successAction={pageState.successAction.get()}
                            />
                            : pageState.formAction.value === FormActionType.ADD ?
                                <CreateForm onSubmit={createSubmit}/>
                                :
                                null
                        }
                      </SideDrawer>
                    </>
                }

              </div>
          }
        </Container>
      </PageFormat>

  )
}
