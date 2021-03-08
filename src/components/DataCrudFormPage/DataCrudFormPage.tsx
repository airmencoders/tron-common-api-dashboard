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
import {CrudPageState, getInitialCrudPageState} from '../../state/crud-page/crud-page-state';
import { State } from '@hookstate/core';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {GridRowData} from '../Grid/grid-row-data';
import DeleteCellRenderer from '../DeleteCellRenderer/DeleteCellRenderer';
import GridColumn from '../Grid/GridColumn';

/***
 * Generic page template for CRUD operations on entity arrays.
 * @param props DataCrudFormPageProps
 * T Row data type
 * R Editable Data type
 */
export function DataCrudFormPage<T extends GridRowData, R> (props: DataCrudFormPageProps<T, R>) {
  const dataState: DataService<any, any> = props.useDataState();

  const pageState: State<CrudPageState<any>> = props.usePageState();

  const DeleteComponent = props.deleteComponent;
  const deleteBtnName = 'Delete';
  let columns: GridColumn[];
  if (props.allowDelete && DeleteComponent) {
    columns = [
      ...props.columns,
      new GridColumn('', false, false, deleteBtnName, 'header-center', DeleteCellRenderer, { onClick: deleteConfirmation })
    ];
  } else {
    columns = props.columns;
  }

  useEffect(() => {
    dataState.fetchAndStoreData();
    
    return () => {
      pageState.set(getInitialCrudPageState());
    }
  }, []);

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    if (props.allowEdit && !(event.api.getFocusedCell()?.column.getColDef().headerName === deleteBtnName)) {
      const rowData = event.data;
      if (rowData != null) {
        const dtoData = await dataState.convertRowDataToEditableData(rowData);
        pageState.set({
          formAction: FormActionType.UPDATE,
          isOpen: true,
          selected: dtoData,
          formErrors: undefined,
          successAction: undefined,
          isSubmitting: false,
        });
      }
    }
  }

  function onAddEntityClick() {
    pageState.set({
      formAction: FormActionType.ADD,
      isOpen: true,
      selected: undefined,
      formErrors: undefined,
      successAction: undefined,
      isSubmitting: false
    });
  }

  function onCloseHandler() {
    pageState.set(getInitialCrudPageState());
  }

  async function deleteConfirmation(deleteItem: R) {
    if (props.allowDelete && deleteItem != null) {
      const data = await dataState.convertRowDataToEditableData(deleteItem);
      pageState.set({
        formAction: FormActionType.DELETE,
        isOpen: true,
        selected: data,
        formErrors: undefined,
        successAction: undefined,
        isSubmitting: false,
      });
    }
  }

  async function deleteSubmit() {
    const deleteItem = pageState.selected.get();

    pageState.set(prevState => ({
      ...prevState,
      isSubmitting: true
    }));

    try {
      await dataState.sendDelete(deleteItem);

      pageState.set(prevState => {
        return {
          ...prevState,
          successAction: {
            success: true,
            successMsg: `Successfully deleted ${props.dataTypeName}.`,
          },
          isSubmitting: false
        }
      });
    }
    catch (error) {
      pageState.set(prevState => {
        return {
          ...prevState,
          formErrors: {
            general: error.message
          },
          isSubmitting: false
        }
      });
    }
  }

  async function updateSubmit(updatedDto: R) {
    pageState.set(prevState => ({
      ...prevState,
      isSubmitting: true
    }));
    try {
      await dataState.sendUpdate(updatedDto);

      pageState.set( prevState => {
        return {
          ...prevState,
          successAction: {
            success: true,
            successMsg: `Successfully updated ${props.dataTypeName}.`,
          },
          isSubmitting: false
        }
      });
    }
    catch (error) {
      pageState.set(prevState => {
        return {
          ... prevState,
          formErrors: {
            general: error.message
          },
          isSubmitting: false
        }
      });
    }
  }

  async function createSubmit(newDto: R) {
    pageState.set(prevState => ({
      ...prevState,
      isSubmitting: true
    }));
    try {
      await dataState.sendCreate(newDto);

      pageState.set( prevState => {
        return {
          ...prevState,
          successAction: {
            success: true,
            successMsg: `Successfully created ${props.dataTypeName}.`,
          },
          isSubmitting: false
        }
      });
    }
    catch (error) {
      pageState.set(prevState => {
        return {
          ... prevState,
          formErrors: {
            general: error.message
          },
          isSubmitting: false
        }
      });
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
                      {
                        props.allowEdit &&
                        <div className="add-app-client">
                          <Button type="button" className="add-app-client__btn" onClick={onAddEntityClick}>
                            Add { props.dataTypeName }
                          </Button>
                        </div>
                      }

                      <Grid
                          data={dataState.state?.get() || []}
                          columns={columns}
                          onRowClicked={onRowClicked}
                          rowClass="ag-grid--row-pointer"
                      />

                      <SideDrawer title={props.dataTypeName} isOpen={pageState.isOpen.get()} onCloseHandler={onCloseHandler}>
                  {
                    pageState.formAction.value === FormActionType.ADD ?
                      <CreateForm
                        onSubmit={createSubmit}
                        formActionType={FormActionType.ADD}
                        formErrors={pageState.formErrors.get()}
                        onClose={onCloseHandler}
                        successAction={pageState.successAction.get()}
                        isSubmitting={pageState.isSubmitting.get()}
                      />
                      : pageState.formAction.value === FormActionType.UPDATE && pageState.selected.get() ?
                        <UpdateForm
                          data={pageState.selected.get()}
                          formErrors={pageState.formErrors.get()}
                          onSubmit={updateSubmit}
                          onClose={onCloseHandler}
                          successAction={pageState.successAction.get()}
                          isSubmitting={pageState.isSubmitting.get()}
                          formActionType={FormActionType.UPDATE}
                        />
                        : pageState.selected.get() && pageState.formAction.value === FormActionType.DELETE && DeleteComponent ?
                          <DeleteComponent
                            data={pageState.selected.get()}
                            formErrors={pageState.formErrors.get()}
                            onSubmit={deleteSubmit}
                            onClose={onCloseHandler}
                            successAction={pageState.successAction.get()}
                            isSubmitting={pageState.isSubmitting.get()}
                          /> 
                          : null
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
