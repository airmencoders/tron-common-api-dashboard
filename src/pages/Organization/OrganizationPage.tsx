import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import {useOrganizationState} from '../../state/organization/organization-state';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('name', true, true, 'Name'),
      new GridColumn('leader', true, true, 'Leader'),
      new GridColumn('orgType', true, true, 'Org Type'),
      new GridColumn('branchType', true, true, 'Branch Type'),
    ];

function OrganizationPage() {
  return (
      <DataCrudFormPage
       allowEdit={false}
       columns={columns}
       // Currently disabled
       createForm={() => <></>}
       dataTypeName="Organization"
       pageTitle="Organizations"
       // Currently disabled
       updateForm={() => <></>}
       useDataState={useOrganizationState}
      />
  );
}

export default OrganizationPage;
