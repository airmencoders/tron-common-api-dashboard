import { Downgraded, State, useState } from '@hookstate/core';
import {IDatasource, IGetRowsParams, RowClickedEvent} from 'ag-grid-community';
import React, {ReactText, useEffect, useRef} from 'react';
import Button from '../../components/Button/Button';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { StatusType } from '../../components/StatusCard/status-type';
import StatusCard from '../../components/StatusCard/StatusCard';
import { CrudPageState, getInitialCrudPageState } from '../../state/crud-page/crud-page-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { DataService } from '../../state/data-service/data-service';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { AgGridFilterConversionError } from '../../utils/Exception/AgGridFilterConversionError';
import DeleteCellRenderer from '../DeleteCellRenderer/DeleteCellRenderer';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { GridFilter } from '../Grid/grid-filter';
import { GridRowData } from '../Grid/grid-row-data';
import GridColumn from '../Grid/GridColumn';
import { convertAgGridSortToQueryParams, generateInfiniteScrollLimit } from '../Grid/GridUtils/grid-utils';
import Spinner from '../Spinner/Spinner';
import { ToastType } from '../Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../Toast/ToastUtils/ToastUtils';
import InfiniteScrollGrid from '../Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import { prepareDataCrudErrorResponse } from '../../state/data-service/data-service-utils';
import DataCrudDelete from './DataCrudDelete';
import './DataCrudFormPage.scss';
import { DataCrudFormPageProps } from './DataCrudFormPageProps';
import { ResponseType } from '../../state/data-service/response-type';
import { PatchResponse } from '../../state/data-service/patch-response';
import { CancelTokenSource } from 'axios';
import FullPageGrid from "../Grid/FullPageGrid/FullPageGrid";
import FullPageInfiniteGrid from "../Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";

/***
 * Generic page template for CRUD operations on entity arrays.
 * @param props DataCrudFormPageProps
 * T Row data type
 * R Editable Data type
 */
export function DataCrudFormPage<T extends GridRowData, R>(props: DataCrudFormPageProps<T, R>): JSX.Element {
  const dataState: DataService<T, R> = props.useDataState();

  const pageState: State<CrudPageState<R>> = useState<CrudPageState<R>>(getInitialCrudPageState());

  const { infiniteScrollOptions: infiniteScroll } = props;

  const updateInfiniteCache = useState<boolean>(false);


  const mountedRef = useRef(false);


  useEffect(() => {
    let cancelTokenSource: CancelTokenSource | undefined = undefined;
    if (!infiniteScroll?.enabled) {
      const cancellableFetch = dataState.fetchAndStoreData();
      cancelTokenSource = cancellableFetch.cancelTokenSource;
    }
    mountedRef.current = true;

    return function cleanup() {
      mountedRef.current = false;
      cancelTokenSource?.cancel();
      dataState.resetState();
    }
  }, []);

  function updateInfiniteCacheCallback() {
    updateInfiniteCache.set(false);
    props.refreshStateCallback?.();
  }

  function setUpdateInfiniteCache(status: boolean) {
    // To avoid sending unnecessary changes to the Grid.
    // Only update infinite cache if infinite scroll is enabled.
    if (infiniteScroll?.enabled) {
      updateInfiniteCache.set(status);
    }
  }

  function createInfiniteScrollDatasource(): IDatasource {
    if (!infiniteScroll?.enabled) {
      throw new Error('Infinite scroll must be enabled to create datasource');
    }

    return {
      getRows: async function (params: IGetRowsParams) {
        if (dataState.fetchAndStorePaginatedData == null) {
          throw new Error('fetchAndStorePaginatedData must exist on the service to use infinite scrolling pagination on Grid');
        }

        try {
          const limit = generateInfiniteScrollLimit(infiniteScroll);
          const page = Math.floor(params.startRow / limit);

          const filter = new GridFilter(params.filterModel);
          const sort = convertAgGridSortToQueryParams(params.sortModel);

          const data = await dataState.fetchAndStorePaginatedData(page,
            limit,
            true,
            filter.getFilterDto(),
            sort);

          let lastRow = -1;

          /**
           * If the request returns data with length of 0, then
           * there is no more data to be retrieved.
           *
           * If the request returns data with length less than the limit,
           * then that is the last page.
           */
          if (data.length == 0 || data.length < limit)
            lastRow = dataState.state.length;

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           *
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          if (err instanceof AgGridFilterConversionError) {
            createTextToast(ToastType.ERROR, err.message, { autoClose: false });
            return;
          }

          const requestErr = prepareRequestError(err);

          /**
           * A 400 status with a filter model set means that the server
           * sent back a validation error.
           */
          if (requestErr.status === 400 && params.filterModel != null) {
            createTextToast(ToastType.ERROR, `Failed to filter with error: ${requestErr.message}`, { autoClose: false });
            return;
          }

          /**
           * Server responded with some other response
           */
          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      }
    }
  }

  function getRowNodeId(data: T): string {
    return data.id != null ? String(data.id) : '';
  }

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    if (props.allowEdit &&
      event.api.getFocusedCell()?.column.getColDef().headerName !== deleteBtnName &&
      event.api.getFocusedCell()?.column.getColDef().headerName !== 'Metrics' &&
      event.api.getFocusedCell()?.column.getColDef().headerName !== 'API Spec') {
      let rowData = event.data;

      // Ensure a blank row was not click before
      // handling it
      if (!rowData)
        return;

      // Take it out of the proxy so that pageState takes
      // the raw object instead of the proxy
      const dataStateItem = dataState.state.find(item => item.id.get() === rowData.id);
      rowData = dataStateItem?.attach(Downgraded).get() ?? Object.assign({}, rowData);

      if (rowData != null) {
        // Set loading state
        pageState.merge({
          isOpen: true,
          isLoading: true
        });

        try {
          const dtoData = await dataState.convertRowDataToEditableData(rowData);

          pageState.merge({
            formAction: FormActionType.UPDATE,
            selected: dtoData,
            formErrors: undefined,
            successAction: undefined,
            isSubmitting: false,
            isLoading: false
          });
        } catch (err) {
          const error = prepareRequestError(err);

          /**
           * Ensures the sidedrawer does not get put into
           * an infinite loading state on error when
           * requesting data.
           */
          pageState.set(getInitialCrudPageState());
          createTextToast(ToastType.ERROR, error.message);
        }
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

  /**
   * Resets state to default.
   * Creates toast with success message.
   *
   * @param message the message to show
   * @returns the id of the toast
   */
  function onActionSuccess(message: string): ReactText {
    setUpdateInfiniteCache(true);
    onCloseHandler();
    return createTextToast(ToastType.SUCCESS, message);
  }

  /**
   * Creates toast notifying of partial update.
   * Creates additional error toasts for each error.
   *
   * @param message The message for the toast that is always created
   * @param errors The error messages for any additional toasts to be created
   * @returns list of toast ids
   */
  function onActionPartialSuccess(message: string, errors?: string[]): ReactText[] {
    setUpdateInfiniteCache(true);

    const ids: ReactText[] = [];
    ids.push(createTextToast(ToastType.WARNING, message));

    if (errors != null) {
      errors.forEach(item => {
        ids.push(createTextToast(ToastType.ERROR, item));
      });
    }

    pageState.merge({
      isSubmitting: false
    })

    return ids;
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

      onActionSuccess(`Successfully deleted ${props.dataTypeName}.`);
    }
    catch (error) {
      pageState.merge({
        formErrors: prepareDataCrudErrorResponse(error),
        isSubmitting: false
      });
    }
  }

  async function updateSubmit(updatedDto: R) {
    pageState.merge({
      isSubmitting: true
    });
    try {
      await dataState.sendUpdate(updatedDto);

      onActionSuccess(`Successfully updated ${props.dataTypeName}.`);
    }
    catch (error) {
      if (mountedRef.current) {
        pageState.merge({
          formErrors: prepareDataCrudErrorResponse(error),
          isSubmitting: false
        });
      }
    }
  }

  async function updatePatch(...args: any) {
    // make sure service implements this optional method...
    if (!dataState.sendPatch) return;

    pageState.merge({
      isSubmitting: true
    });

    try {
      const response = await dataState.sendPatch(...args);

      switch (response.type) {
        case ResponseType.SUCCESS: {
          onActionSuccess(`Successfully updated ${props.dataTypeName}.`);
          break;
        }

        case ResponseType.PARTIAL: {
          const errors = response.errors;
          onActionPartialSuccess(`Partial updated on ${props.dataTypeName} successful.`, errors?.map(error => {
            const preparedMessage = prepareDataCrudErrorResponse(error);

            return preparedMessage.general ?? error.message;
          }));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      const response = error as PatchResponse<T>;
      response.errors?.forEach(err => {
        const preparedMessage = prepareDataCrudErrorResponse(err);
        createTextToast(ToastType.ERROR, preparedMessage.general ?? err.message);
      });
      if (mountedRef.current) {
        pageState.merge({
          formErrors: {
            general: `Failed to update ${props.dataTypeName}`
          },
          isSubmitting: false
        });
      }
    }
  }

  async function createSubmit(newDto: R) {
    pageState.merge({
      isSubmitting: true
    });
    try {
      await dataState.sendCreate(newDto);

      onActionSuccess(`Successfully created ${props.dataTypeName}.`);
    }
    catch (error) {
      if (mountedRef.current) {
        pageState.merge({
          formErrors: prepareDataCrudErrorResponse(error),
          isSubmitting: false
        });
      }
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
        valueGetter: GridColumn.defaultValueGetter,
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
      <PageFormat pageTitle={props.pageTitle} className={`${props.className ?? ''}`}>
        <ErrorBoundary>

          {/* render any children before the ag grid (if present) */}
          {
            props.beforeChildren ?
              <div style={{ marginBottom: '10px' }}>
                {props.beforeChildren}
              </div>
              :
              null
          }
          {dataState.isPromised ?
            <Spinner centered />
            :
            dataState.error ?
              <StatusCard status={StatusType.ERROR} title={props.pageTitle} />
              :
              <div className="data-crud-content" >
                {
                  props.allowAdd && CreateForm &&
                  <div className="add-data-container">
                    <Button type="button" className="add-data-container__btn" onClick={onAddEntityClick}>
                      { props.dataTypeIcon !== undefined && props.dataTypeIcon }
                      Add {props.dataTypeName}
                    </Button>
                  </div>
                }
                {infiniteScroll?.enabled ?
                  <FullPageInfiniteGrid
                    columns={columns}
                    onRowClicked={onRowClicked}
                    rowClass="ag-grid--row-pointer"
                    autoResizeColumns={props.autoResizeColumns}
                    autoResizeColummnsMinWidth={props.autoResizeColummnsMinWidth}
                    disabledGridColumnVirtualization={props.disableGridColumnVirtualization}
                    datasource={createInfiniteScrollDatasource()}
                    cacheBlockSize={generateInfiniteScrollLimit(infiniteScroll)}
                    maxBlocksInCache={infiniteScroll.maxBlocksInCache}
                    maxConcurrentDatasourceRequests={infiniteScroll.maxConcurrentDatasourceRequests}
                    scrollToTop={props.scrollToTop}
                    scrollToTopCallback={props.scrollToTopCallback}
                    updateInfiniteCache={props.refreshState || updateInfiniteCache.get()}
                    updateInfiniteCacheCallback={updateInfiniteCacheCallback}
                  />
                  :
                  <FullPageGrid
                    data={[...dataState.state.attach(Downgraded).get()]}
                    columns={columns}
                    onRowClicked={onRowClicked}
                    rowClass="ag-grid--row-pointer"
                    autoResizeColumns={props.autoResizeColumns}
                    autoResizeColummnsMinWidth={props.autoResizeColummnsMinWidth}
                    disabledGridColumnVirtualization={props.disableGridColumnVirtualization}
                    scrollToTop={props.scrollToTop}
                    scrollToTopCallback={props.scrollToTopCallback}
                    getRowNodeId={getRowNodeId}
                    immutableData
                  />
                }

                <SideDrawer isLoading={pageState.isLoading.get()}
                  title={props.dataTypeName}
                  isOpen={pageState.isOpen.get()}
                  onCloseHandler={onCloseHandler}
                  size={props.sideDrawerSize}
                >
                  {
                    pageState.formAction.value === FormActionType.ADD && CreateForm ?
                      <CreateForm
                        onSubmit={createSubmit}
                        formActionType={FormActionType.ADD}
                        formErrors={pageState.formErrors.get()}
                        onClose={onCloseHandler}
                        successAction={pageState.successAction.get()}
                        isSubmitting={pageState.isSubmitting.get()}
                      />
                      : pageState.formAction.value === FormActionType.UPDATE && UpdateForm && pageState.selected.get() ?
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
        </ErrorBoundary>
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
