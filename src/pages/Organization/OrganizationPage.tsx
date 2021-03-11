import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import OrganizationEditForm from './OrganizationEditForm';
import {useOrganizationState} from '../../state/organization/organization-state';
import {useCrudPageState} from '../../state/crud-page/crud-page-state';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('name', true, true, 'Name'),
      new GridColumn('leader', true, true, 'Leader'),
      new GridColumn('parentOrganization', true, true, 'Parent Org Id'),
      new GridColumn('orgType', true, true, 'Org Type'),
      new GridColumn('branchType', true, true, 'Branch Type'),
    ];

function OrganizationPage() {
  return (
      <DataCrudFormPage
       allowEdit={true}
       columns={columns}
       createForm={OrganizationEditForm}
       dataTypeName="Organization"
       pageTitle="Organizations"
       updateForm={OrganizationEditForm}
       useDataState={useOrganizationState}
       usePageState={useCrudPageState}
      />
  );
}

export default OrganizationPage;
