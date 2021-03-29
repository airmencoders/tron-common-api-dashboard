import { RowClickedEvent } from 'ag-grid-community';
import React, { useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { StatusType } from '../../components/StatusCard/status-type';
import StatusCard from '../../components/StatusCard/StatusCard';
import Button from '../../components/Button/Button';
import {DataCrudFormPageProps} from './DataCrudFormPageProps';
import {DataService} from '../../state/data-service/data-service';
import {CrudPageState, getInitialCrudPageState} from '../../state/crud-page/crud-page-state';
import { Downgraded, State, useState } from '@hookstate/core';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {GridRowData} from '../Grid/grid-row-data';
import './DataCrudFormPage.scss';
import DeleteCellRenderer from '../DeleteCellRenderer/DeleteCellRenderer';
import GridColumn from '../Grid/GridColumn';
import Spinner from '../Spinner/Spinner';
import DataCrudDelete from './DataCrudDelete';

/***
 * Generic page template for CRUD operations on entity arrays.
 * @param props DataCrudFormPageProps
 * T Row data type
 * R Editable Data type
 */
export function DataCrudFormPage<T extends GridRowData, R> (props: DataCrudFormPageProps<T, R>) {
  const dataState: DataService<T, R> = props.useDataState();

  const pageState: State<CrudPageState<R>> = useState<CrudPageState<R>>(getInitialCrudPageState());

  useEffect(() => {
    dataState.fetchAndStoreData();
  }, []);

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    if (props.allowEdit && !(event.api.getFocusedCell()?.column.getColDef().headerName === deleteBtnName)) {
      let rowData = event.data;

      // Take it out of the proxy so that pageState takes
      // the raw object instead of the proxy
      const dataStateItem = dataState.state.find(item => item.id.get() === rowData.id);
      rowData = dataStateItem?.attach(Downgraded).get() ?? Object.assign({}, rowData);

      if (rowData != null) {
        const dtoData = await dataState.convertRowDataToEditableData(rowData);
        pageState.merge({
          formAction: FormActionType.UPDATE,
          isOpen: true,
          selected: dtoData,
          formErrors: undefined,
          successAction: undefined,
          isSubmitting: false
        });
      }
    }
  }

  function onAddEntityClick() {
    pageState.merge({
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

  async function deleteConfirmation(deleteItem: T) {
    if (props.allowDelete && deleteItem != null) {
      /**
       * Find the item in dataState and remove the proxy here.
       * Uses Hookstate's Downgraded plugin. Wait until we need the raw item
       * to use Downgraded so that we can keep the benefits of proxy usage until the end.
       *
       * The item should always exist in dataState but we keep Object.assign()
       * as the fallback.
       */
      const dataStateItem = dataState.state.find(item => item.id.get() === deleteItem.id);
      deleteItem = dataStateItem?.attach(Downgraded).get() ?? Object.assign({}, deleteItem);

      const data = await dataState.convertRowDataToEditableData(deleteItem);

      pageState.merge({
        isDeleteConfirmationOpen: true,
        selected: data,
        formErrors: undefined,
        successAction: undefined,
        isSubmitting: false
      });
    }
  }

  async function deleteSubmit() {
    const deleteItem = pageState.selected.get();

    if (deleteItem == null)
      return;

    pageState.isSubmitting.set(true);

    try {
      await dataState.sendDelete(deleteItem);

      pageState.merge({
        isDeleteConfirmationOpen: false,
        successAction: {
          success: true,
          successMsg: `Successfully deleted ${props.dataTypeName}.`
        },
        isSubmitting: false
      });

    }
    catch (error) {
      pageState.merge({
        formErrors: {
          general: error.message
        },
        isSubmitting: false
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

  async function updatePatch(...args: any) {

    // make sure service implements this optional method...
    if (!dataState.sendPatch) return;

    pageState.set(prevState => ({
      ...prevState,
      isSubmitting: false
    }));
    try {
      await dataState.sendPatch(...args);

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
  const DeleteComponent = props.deleteComponent;

  const deleteBtnName = 'Delete';
  let columns: GridColumn[];
  if (props.allowDelete && DeleteComponent) {
    columns = [
      ...props.columns,
      new GridColumn({
        headerName: deleteBtnName,
        headerClass: 'header-center',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: deleteConfirmation }
      })
    ];
  } else {
    columns = props.columns;
  }

  const selectedData = pageState.selected.get();

  return (
    <>
      <PageFormat pageTitle={props.pageTitle}>
        {dataState.isPromised ? 
          <Spinner centered />
          : 
          dataState.error ?
            <StatusCard status={StatusType.ERROR} title={props.pageTitle} />
            :
            <div style={{ height: '100%' }}>
              {
                props.allowAdd && CreateForm &&
                <div className="add-data-container">
                  <Button type="button" className="add-data-container__btn" onClick={onAddEntityClick}>
                    Add { props.dataTypeName }
                  </Button>
                </div>
              }

              <Grid
                data={dataState.state.get()}
                columns={columns}
                onRowClicked={onRowClicked}
                rowClass="ag-grid--row-pointer"
                autoResizeColumns={props.autoResizeColumns}
                autoResizeColummnsMinWidth={props.autoResizeColummnsMinWidth}
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
                        data={pageState.selected.attach(Downgraded).get()}
                      formErrors={pageState.formErrors.get()}
                      onSubmit={updateSubmit}
                      onPatch={updatePatch}
                      onClose={onCloseHandler}
                      successAction={pageState.successAction.get()}
                      isSubmitting={pageState.isSubmitting.get()}
                      formActionType={FormActionType.UPDATE}
                    />
                    : null
                }
              </SideDrawer>
            </div>
        }
      </PageFormat>
      
      {props.allowDelete && DeleteComponent && selectedData &&
        <DataCrudDelete
          dataTypeName={props.dataTypeName}
          onCancel={onCloseHandler}
          onSubmit={deleteSubmit}
          deleteComponent={DeleteComponent}
          data={selectedData}
          show={pageState.isDeleteConfirmationOpen.get()}
          disableSubmit={pageState.isSubmitting.get() || pageState.successAction.get()?.success || false}
          errors={pageState.formErrors.get()}
        />
      }
    </>
  )
}
