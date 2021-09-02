import React, {useEffect} from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import {PubSubCollection} from '../../state/pub-sub/pubsub-service';
import {useSubscriptionState} from '../../state/pub-sub/pubsub-state';
import PubSubDelete from './PubSubDelete';
import PubSubForm from './PubSubForm';
import PrivilegeCellRenderer from "../../components/PrivilegeCellRenderer/PrivilegeCellRenderer";
import {useHookstate} from "@hookstate/core";
import {useAppClientsState} from "../../state/app-clients/app-clients-state";
import {PrivilegeType} from "../../state/privilege/privilege-type";
import {accessAuthorizedUserState} from "../../state/authorized-user/authorized-user-state";

const columns: GridColumn[] = [
  new GridColumn({
    field: 'appClientUser',
    sortable: true,
    filter: true,
    headerName: 'App Client Name',
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Person Change',
    field: 'personChange',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Person Delete',
    field: 'personDelete',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Org Change',
    field: 'organizationChange',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Org Delete',
    field: 'organizationDelete',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Person Org Add',
    field: 'personOrgAdd',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Person Org Remove',
    field: 'personOrgRemove',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Sub Org Add',
    field: 'subOrgAdd',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    sortable: false,
    headerName: 'Sub Org Remove',
    field: 'subOrgRemove',
    cellRenderer: PrivilegeCellRenderer
  }),
];

function PubSubPage() {
  const currentUser = accessAuthorizedUserState();
  const pubSubState = useSubscriptionState();
  const appClientState = useAppClientsState();
  const showNewButtonState = useHookstate(false);
  const showTableForEdits = useHookstate(false);

  useEffect(() => {

    // only DASHBOARD_ADMIN or APP_CLIENT_DEVs can be here
    const allowedToSee = currentUser.authorizedUserHasAnyPrivilege(
        [PrivilegeType.DASHBOARD_ADMIN, PrivilegeType.APP_CLIENT_DEVELOPER]);

    if (!allowedToSee || pubSubState.isPromised || appClientState.isPromised) {
      showTableForEdits.set(false);
    }
    else {
      // see if there's any app clients that are available for the user to see/edit
      //  the app clients must also have a read privilege of some sort
      const authorizedAppClients = appClientState.appClients
          .filter(item =>
                (item.appClientDeveloperEmails?.includes(currentUser.authorizedUser?.email ?? '')
                    || (currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)))
                && (item.orgRead || item.personRead)
          );

      const foundUnassignedAppClient = authorizedAppClients.length > pubSubState.state.get().length;
      showTableForEdits.set(true);
      showNewButtonState.set(foundUnassignedAppClient);
    }

  }, [pubSubState.state.promised, pubSubState.subscriberData.length]);

  return (
      <DataCrudFormPage<PubSubCollection, PubSubCollection>
          columns={columns}
          dataTypeName='Subscriber'
          pageTitle='Pub Sub Subscribers'
          createForm={PubSubForm}
          updateForm={PubSubForm}
          useDataState={useSubscriptionState}
          allowEdit={showTableForEdits.get()}
          allowDelete={showTableForEdits.get()}
          allowAdd={showNewButtonState.get()}
          deleteComponent={PubSubDelete}
          autoResizeColumns
          autoResizeColummnsMinWidth={1200}
      />
  )
}

export default PubSubPage;