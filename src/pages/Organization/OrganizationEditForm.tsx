import { createState, useState } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { GridApi, RowClickedEvent } from 'ag-grid-community';
import { AxiosResponse } from 'axios';
import React, { ChangeEvent, FormEvent, useEffect } from 'react';
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Select from '../../components/forms/Select/Select';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import Grid from '../../components/Grid/Grid';
import GridColumn from '../../components/Grid/GridColumn';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import Modal from '../../components/Modal/Modal';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../openapi/models';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { useOrganizationState } from '../../state/organization/organization-state';
import { usePersonState } from '../../state/person/person-state';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';


interface PersonWithDetails {
  id?: string,
  firstName?: string,
  lastName?: string,
}

interface OrgWithDetails {
  id?: string,
  name?: string,
}

interface OrganizationDtoWithDetails {
  id?: string;
  leader?: PersonWithDetails;
  members?: Array<PersonWithDetails>;
  parentOrganization?: string;
  subordinateOrganizations?: Array<OrgWithDetails>;
  name?: string;
  orgType?: OrganizationDtoOrgTypeEnum;
  branchType?: OrganizationDtoBranchTypeEnum;
}

// complex parts of the org we can edit -- for now...
enum OrgEditOpType {
  NONE = 'NONE',
  LEADER_EDIT = 'LEADER_EDIT',
  MEMBERS_EDIT = 'MEMBERS_EDIT',
  SUB_ORGS_EDIT = 'SUB_ORGS_EDIT',
}

interface OrgPatchResultOp {
  code: number,
  message: string,
  isError: boolean,
}

function OrganizationEditForm(props: CreateUpdateFormProps<OrganizationDto>) {
  const SELECT_ALL_TEXT = "Select All";
  const DESELECT_ALL_TEXT = "Unselect All";
  const personState = usePersonState();  // handle to the person-service and state
  const orgState = useOrganizationState();  // handle to the org-service and state
  const formState = useState(createState({...props.data})); // data from the UI form
  const showChooserDialog = useState(createState(false)); // whether to show the Choose Dialog
  const chooserDataItems = useState(createState(new Array<PersonDto | OrganizationDto>()));  // the data to show in Chooser
  const orgDetails = useState(createState({} as OrganizationDtoWithDetails)); // selected org with extra, resolved information
  const chooserChosenRow = useState(createState({} as RowClickedEvent | undefined));  // the chosen row from the chooser dialog
  const chooserDataColumns = useState(createState(new Array<GridColumn>()));  // the chosen row from the chooser dialog
  const orgEditType = useState(createState(OrgEditOpType.NONE));  // what part of the org we're adding to
  const [membersGridApi, setMembersGridApi] = React.useState({} as GridApi | undefined); // handle to the Grid API for members
  const [subOrgsGridApi, setSubOrgsGridApi] = React.useState({} as GridApi | undefined); // handle to the Grid API for subordinate orgs
  const [orgPatchLeaderResult, setOrgPatchOpResult] = React.useState<OrgPatchResultOp | undefined>(undefined);
  
  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  // load in the org with all details if editing to the 'orgDetails' state
  useEffect(() => {
    (async function() {
      if (props.formActionType === FormActionType.UPDATE) {
        orgDetails.set(await orgState.getOrgDetails(formState.get().id || ''));
      }
    })()
  }, []);

  const requiredText = (text: string | undefined): boolean => text != null && text.length > 0 && text.trim().length > 0;

  const requiredError = 'cannot be empty or blank';
  Validation(formState.name).validate(requiredText, requiredError, 'error');

  const isFormModified = (): boolean => {
    const stateKeys = formState.keys;
    let isChanged = false;
    for (let i = 0; i < stateKeys.length; i++) {
      const key = stateKeys[i];
      const origValue = props.data?.[key] == null || props.data[key] === '' ? '' : props.data?.[key];
      const formStateValue = formState[key]?.get() == null || formState[key]?.get() === '' ? '' : formState[key]?.get();
      if (formStateValue !== origValue) {
        isChanged = true;
        break;
      }
    }

    // if this is an update operation, don't require we go thru and TOUCH everything 
    //  because some fields will likely remain the same thus untouched
    return props.formActionType === FormActionType.UPDATE || isChanged;
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  const isFormDisabled = ():boolean => {
    return props.successAction?.success || false;
  }

  // helper to construct the leader's name 
  const resolveLeaderName = () => {
    return `${orgDetails.get().leader?.firstName || ''} ${orgDetails.get().leader?.lastName || ''}`.trim();
  }

  // invoked when branch selection is changed
  const onBranchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const stringVal = event.target.value;
    const branchEnumKey = getEnumKeyByEnumValue(OrganizationDtoBranchTypeEnum, stringVal);
    if (branchEnumKey == null) {
      throw new Error('Selected branch is not part of enum.');
    }
    const branchEnum = OrganizationDtoBranchTypeEnum[branchEnumKey];
    formState.branchType.set(branchEnum);
  }

  // invoked when org type selection is changed
  const onTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const stringVal = event.target.value;
    const typeEnumKey = getEnumKeyByEnumValue(OrganizationDtoOrgTypeEnum, stringVal);
    if (typeEnumKey == null) {
      throw new Error('Selected branch is not part of enum.');
    }
    const typeEnum = OrganizationDtoOrgTypeEnum[typeEnumKey];
    formState.orgType.set(typeEnum);
  }

  // invoked from clicking `Edit` button by the Org Leader field
  const onEditLeaderClick = async () => {

    // get list of people, go fetch if person state doesn't exist yet
    if (personState.state.get() == null || personState.state.get().length === 0) {
      await personState.fetchAndStoreData();
    }

    // clone the people list and set to the chooser items
    chooserDataItems.set([...personState.state.get()]);
    orgEditType.set(OrgEditOpType.LEADER_EDIT);
    chooserDataColumns.set([ 
      new GridColumn('id', true, true, 'ID'),
      new GridColumn('firstName', true, true, 'First'),
      new GridColumn('lastName', true, true, 'Last')
    ]);
    showChooserDialog.set(true);
  }

  // invoked from clicking `Add` button for Org Members
  const onAddMemberClick = async () => {

    // get list of people, go fetch if person state doesn't exist yet
    if (personState.state.get() == null || personState.state.get().length === 0) {
      await personState.fetchAndStoreData();
    }

    // clone the people list and set to the chooser items
    chooserDataItems.set([...personState.state.get()]);
    orgEditType.set(OrgEditOpType.MEMBERS_EDIT);
    chooserDataColumns.set([ 
      new GridColumn('id', true, true, 'ID'),
      new GridColumn('firstName', true, true, 'First'),
      new GridColumn('lastName', true, true, 'Last')
    ]);
    showChooserDialog.set(true);
  }

  // invoked from clicking `Remove` button for Org Members
  const onRemoveMemberClick = async () => {

    const memberRowSel = membersGridApi?.getSelectedRows();
    if (memberRowSel && memberRowSel.length > 0) {
      const orgResponse = await orgState.removeMember(orgDetails.get().id || '', memberRowSel.map(item => item.id));  
      formState.set(orgResponse);
      orgDetails.set(await orgState.getOrgDetails(formState.get().id || ''));
    }
  }

  // invoked from clicking `Remove` on the org's leader entry
  const onClearOrgLeader = async () => {
    const orgResponse = await orgState.removeLeader(orgDetails.get().id || '');
    formState.set(orgResponse);
    orgDetails.set(await orgState.getOrgDetails(formState.get().id || ''));
  }

  // invoked from clicking `Add` button for Subordinate Orgs
  const onAddSubOrgClick = async () => {

    // get list of orgs, go fetch if orgs state doesn't exist yet or is empty
    if (orgState.state.get() == null || orgState.state.get().length === 0) {
      await orgState.fetchAndStoreData();
    }

    // clone the orgs list and set to the chooser items
    chooserDataItems.set([...orgState.state.get()]);
    orgEditType.set(OrgEditOpType.SUB_ORGS_EDIT);
    chooserDataColumns.set([ 
      new GridColumn('id', true, true, 'ID'),
      new GridColumn('name', true, true, 'Name')
    ]);
    showChooserDialog.set(true);
  }

  // invoked from clicking `Remove` button for Subordinate Orgs
  const onRemoveSubOrgClick = async () => {

    const subOrgRowSel = subOrgsGridApi?.getSelectedRows();
    if (subOrgRowSel && subOrgRowSel.length > 0) {
      const orgResponse = await orgState.removeSubOrg(orgDetails.get().id || '', subOrgRowSel.map(item => item.id));  
      formState.set(orgResponse);
      orgDetails.set(await orgState.getOrgDetails(formState.get().id || ''));
    }
  }

  // a tabular row in the Chooser dialog was clicked, store it to some temp state
  const chooserRowClicked = async (event: RowClickedEvent) => {
    chooserChosenRow.set(event);
  }

  // user cancelled out of the choose dialog
  const chooserDialogClose = () => {
    // clear temp state(s) and dismiss dialog
    orgEditType.set(OrgEditOpType.NONE);
    chooserChosenRow.set(undefined);
    showChooserDialog.set(false);
  }

  const resolvePatchOpInfo = (orgResponse: AxiosResponse)  => {
    const retVal = {
      code: orgResponse.status,
      isError: orgResponse.status !== 200 && orgResponse.status !== 204,   
      message: '',   
    };

    if (retVal.isError) {
      retVal.message = orgResponse.statusText + ` ${retVal.code}`;
    }
    else {
      retVal.message = 'Organization Updated';
    }

    setOrgPatchOpResult(retVal);
  }

  const resolveInvalidPatchOp = (orgResponse : Error) => {
    setOrgPatchOpResult( {
      isError: true,
      code: 0,
      message: orgResponse.message,
    })
  }

  // user chose OK (confirm an action) to do and close the chooser dialog
  const chooserDialogConfirmed = async () => {
    
    // validate we have some kind of data to PATCH against the org
    let orgResponse: any;    
    if (chooserChosenRow.get() !== undefined) {
      switch (orgEditType.get()) {
        case OrgEditOpType.LEADER_EDIT:
          orgResponse = await orgState.updateLeader(orgDetails.get().id || '', chooserChosenRow.get()?.data.id);          
          break;
        case OrgEditOpType.MEMBERS_EDIT:
          orgResponse = await orgState.addMember(orgDetails.get().id || '', chooserChosenRow.get()?.data.id);
          break;
        case OrgEditOpType.SUB_ORGS_EDIT:
          orgResponse = await orgState.addSubOrg(orgDetails.get().id || '', chooserChosenRow.get()?.data.id);
          break;
        default:
          break;
      }
      
      if (orgResponse.data) {        
        resolvePatchOpInfo(orgResponse);
        formState.set(orgResponse.data);
        orgDetails.set(await orgState.getOrgDetails(formState.get().id || ''));
      }
      else {
        resolveInvalidPatchOp(orgResponse);
      }
    }

    chooserDialogClose();
  }
  
  return (
      <div className="organization-edit-form">
        <Form onSubmit={submitForm}>
          <FormGroup labelName="orgName" labelText="Organization Name"
                     isError={Touched(formState.name).touched() && Validation(formState.name).invalid()}
                     errorMessages={Validation(formState.name).errors()
                         .map(validationError =>validationError.message)}
          >
            <TextInput id="orgName" name="orgName" type="text"
              defaultValue={props.data?.name || ''}
              error={Touched(formState.name).touched() && Validation(formState.name).invalid()}
              onChange={(event) => formState.name.set(event.target.value)}
              disabled={isFormDisabled()}
            />
          </FormGroup>         
          <FormGroup labelName="branch" labelText="Branch">
            <Select id="branch" name="branch" data-testid="branchType"
                    defaultValue={props.data?.branchType || ''}
                    onChange={onBranchChange}
                    disabled={isFormDisabled()}
            >
              {
                Object.values(OrganizationDtoBranchTypeEnum).map((branchName) => {
                    return <option key={branchName} value={branchName}>{branchName}</option>
                })
              }
            </Select>
          </FormGroup>
          <FormGroup labelName="type" labelText="Type"
                     errorMessages={Validation(formState.orgType).errors()
                         .map(validationError =>validationError.message)}
          >
            <Select id="type" name="type" data-testid="orgType"
                    defaultValue={props.data?.orgType || ''}
                    onChange={onTypeChange}
                    disabled={isFormDisabled()}
            >
              {
                Object.values(OrganizationDtoOrgTypeEnum).map((typeName) => {
                  return <option key={typeName} value={typeName}>{typeName}</option>
                })
              }
            </Select>
          </FormGroup>
          {
            props.formActionType === FormActionType.UPDATE ?
              <>

                {/* Edit/Remove Org Leader Section */}
                <FormGroup labelName="leaderName" labelText="Leader">
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TextInput id="leaderName" name="leader" type="text" data-testid='org-leader-name'
                      defaultValue={resolveLeaderName()}
                      value={resolveLeaderName()}
                      disabled={true}
                    />
                    <Button data-testid='change-org-leader__btn' unstyled type="button" onClick={onEditLeaderClick}>
                      Change
                    </Button>
                    <Button data-testid='remove-org-leader__btn' unstyled type="button" onClick={onClearOrgLeader}>
                      Remove
                    </Button>
                  </div>
                  <div>
                  <SuccessErrorMessage successMessage={orgPatchLeaderResult?.message}
                      errorMessage={orgPatchLeaderResult?.message || ''}
                      showErrorMessage={orgPatchLeaderResult != null && orgPatchLeaderResult.isError}
                      showSuccessMessage={orgPatchLeaderResult != null && !orgPatchLeaderResult.isError}
                      showCloseButton={false}
                      onCloseClicked={props.onClose} />
                  </div>
                </FormGroup> 

                {/* Add/Remove Org Members Section */}
                <FormGroup labelName="membersList" labelText={`Organization Members (${orgDetails.get().members?.length || 0})`} >
                  <div style={{display: 'flex', width: '100%', justifyContent: 'space-around', margin: '1rem', paddingRight: '1rem'}}>
                    <Button style={{marginTop: 0}} data-testid='org-add-member__btn' unstyled type="button" onClick={onAddMemberClick}>
                      Add
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-member-select-all__btn' unstyled type="button" onClick={() => membersGridApi?.selectAllFiltered()}>
                      {SELECT_ALL_TEXT}
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-member-deselect-all__btn' unstyled type="button" onClick={() => membersGridApi?.deselectAll()}>
                      {DESELECT_ALL_TEXT}
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-member-remove-selected__btn' unstyled type="button" onClick={onRemoveMemberClick}>
                      Remove
                    </Button>
                  </div>
                  <Grid
                      onGridReady={(event: GridApi | undefined) => setMembersGridApi(event)}
                      rowSelection='multiple'
                      height="300px"
                      data-testid="membersList"
                      data={orgDetails.get().members || []}
                      columns={[
                        new GridColumn('lastName', true, true, 'Last'),
                        new GridColumn('firstName', true, true, 'First'),
                      ]}
                      rowClass="ag-grid--row-pointer"
                  />
                </FormGroup>

                {/* Add/Remove Org Subordinate Orgs Section */}
                <FormGroup labelName="subOrgsList" labelText={`Subordinate Organizations  (${orgDetails.get().subordinateOrganizations?.length || 0})`}>
                  <div style={{display: 'flex', width: '100%', justifyContent: 'space-around', margin: '1rem', paddingRight: '1rem'}}>
                    <Button style={{marginTop: 0}} data-testid='org-add-suborg__btn' unstyled type="button" onClick={onAddSubOrgClick}>
                      Add
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-suborg-select-all__btn' unstyled type="button" onClick={() => subOrgsGridApi?.selectAllFiltered()}>
                      {SELECT_ALL_TEXT}
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-suborg-deselect-all__btn' unstyled type="button" onClick={() => subOrgsGridApi?.deselectAll()}>
                      {DESELECT_ALL_TEXT}
                    </Button>
                    <Button style={{marginTop: 0}} data-testid='org-suborg-remove-selected__btn' unstyled type="button" onClick={onRemoveSubOrgClick}>
                      Remove
                    </Button>
                  </div>
                  <Grid
                      onGridReady={(event: GridApi | undefined) => setSubOrgsGridApi(event)}
                      rowSelection='multiple'
                      height="300px"
                      data-testid="subOrgsList"
                      data={orgDetails.get().subordinateOrganizations || []}
                      columns={[
                        new GridColumn('name', true, true, 'Name'),
                      ]}
                      rowClass="ag-grid--row-pointer"
                  />
                </FormGroup>
              </>
            :
              null
          }
          <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={props.successAction != null && props.successAction?.success}
                               showCloseButton={true}
                               onCloseClicked={props.onClose} />
          {
            props.successAction == null &&
            <SubmitActions formActionType={props.formActionType}
                           onCancel={props.onClose}
                           onSubmit={submitForm}
                           isFormValid={Validation(formState).valid()}
                           isFormModified={isFormModified()}
                           isFormSubmitting={props.isSubmitting}
            />
          }
        </Form>
        <Modal
          show={showChooserDialog.get()}
          headerComponent={(<h2>Pick Person</h2>)}
          footerComponent={(
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Button type="button" data-testid='chooser-cancel-btn' className="add-app-client__btn" secondary onClick={chooserDialogClose}>
                Cancel
              </Button>
              <Button type="button" data-testid='chooser-ok-btn' className="add-app-client__btn" secondary onClick={chooserDialogConfirmed}>
                OK
              </Button>
            </div>
          )}
          onHide={() => showChooserDialog.set(false)}
          height="500px"
          width="30%"
        >
          <ItemChooser
            items={chooserDataItems.get()}
            columns={chooserDataColumns.get()}
            onRowClicked={chooserRowClicked}
            />
        </Modal>
      </div>
  );
}

export default OrganizationEditForm;
