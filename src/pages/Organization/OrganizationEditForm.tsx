import { none, State, useHookstate, useState } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { GridApi, RowClickedEvent } from 'ag-grid-community';
import React, { ChangeEvent, FormEvent } from 'react';
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
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import '../../components/Modal/ModalFooterSubmit.scss';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../openapi/models';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { OrgEditOpType } from '../../state/organization/organization-service';
import { OrganizationDtoWithDetails, OrgWithDetails, PersonWithDetails, useOrganizationState } from '../../state/organization/organization-state';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';

export interface OrganizationEditState {
  leader: OrganizationLeaderState;
  parentOrg: OrganizationParentState;
  members: OrganizationMemberState;
  subOrgs: OrganizationSubOrgState;
}

interface OrganizationLeaderState {
  removed: boolean;
  newLeader?: PersonDto;
}

interface OrganizationParentState {
  removed: boolean;
  newParent?: OrganizationDto;
}

interface OrganizationMemberState {
  toRemove: OrganizationDto[];
  toAdd: OrganizationDto[];
}

interface OrganizationSubOrgState {
  toRemove: OrganizationDto[];
  toAdd: OrganizationDto[];
}

function getDefaultOrganizationEditState(): OrganizationEditState {
  return {
    leader: {
      removed: false,
      newLeader: undefined
    },
    parentOrg: {
      removed: false,
      newParent: undefined
    },
    members: {
      toAdd: [],
      toRemove: []
    },
    subOrgs: {
      toAdd: [],
      toRemove: []
    }
  };
}

function OrganizationEditForm(props: CreateUpdateFormProps<OrganizationDtoWithDetails>) {
  const SELECT_ALL_TEXT = "Select All";
  const DESELECT_ALL_TEXT = "Unselect All";
  const orgState = useOrganizationState();  // handle to the org-service and state
  const formState = useState({ ...props.data }); // data from the UI form

  const formStateExtended = useState<OrganizationEditState>(getDefaultOrganizationEditState());

  const [showChooserDialog, setChooserDialog] = React.useState(false); // whether to show the Chooser Dialog
  const [chooserDataType, setChooserDataType] = React.useState<'person' | 'organization'>('person');  // the data to show in Chooser dialog
  const [chooserChosenRow, setChooserChosenRow] = React.useState({} as RowClickedEvent | undefined);  // the chosen row from the Chooser dialog
  const [chooserDataColumns, setChooserDataColumns] = React.useState(new Array<GridColumn>());  // the chosen row from the chooser dialog

  const [orgEditType, setOrgEditType] = React.useState(OrgEditOpType.NONE);  // what part of the org we're adding to

  const [membersGridApi, setMembersGridApi] = React.useState<GridApi | undefined>(undefined); // handle to the Grid API for members
  const [subOrgsGridApi, setSubOrgsGridApi] = React.useState<GridApi | undefined>(undefined); // handle to the Grid API for subordinate orgs
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false); // whether to show attribute remove confirmation
  const [removeAction, setRemoveAction] = React.useState<{ data: any, func: any}>({ data: null, func: null}); // on a remove action that is confirmed, call this function to do the removing
  const [showPatchResult, setShowPatchResult] = React.useState({ leader: false, parent: false, members: false, suborgs: false});  // state determining where our success/error msg shows up

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => validateRequiredString(name), validationErrors.requiredText, 'error');
  Validation(formState.name).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  function isFormModified(): boolean {
    return Initial(formState).modified();
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Handles adding
    if (props.formActionType === FormActionType.ADD) {
      props.onSubmit(formState.get());
      return;
    }

    // On updates, just send to patch as everything can be handled there
    if (props.formActionType === FormActionType.UPDATE && props.onPatch) {
      props.onPatch(props.data, formState.get(), formStateExtended.get());
      return;
    }

    return;
  }

  const isFormDisabled = ():boolean => {
    return false;
  }

  // helper to construct the leader's name 
  const resolveLeaderName = () => {
    return `${formState.leader.get()?.firstName ?? ''} ${formState.leader.get()?.lastName ?? ''}`;
  }

  // invoked when branch selection is changed
  const onBranchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setOrgEditType(OrgEditOpType.OTHER);
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
    setOrgEditType(OrgEditOpType.OTHER);
    const stringVal = event.target.value;
    const typeEnumKey = getEnumKeyByEnumValue(OrganizationDtoOrgTypeEnum, stringVal);
    if (typeEnumKey == null) {
      throw new Error('Selected branch is not part of enum.');
    }
    const typeEnum = OrganizationDtoOrgTypeEnum[typeEnumKey];
    formState.orgType.set(typeEnum);
  }

  // invoked from clicking `Edit` button by the Org Leader field
  function onEditLeaderClick() {
    setOrgEditType(OrgEditOpType.LEADER_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID',
        checkboxSelection: true,
      }),
      new GridColumn({
        field: 'firstName',
        sortable: true,
        filter: true,
        headerName: 'First'
      }),
      new GridColumn({
        field: 'lastName',
        sortable: true,
        filter: true,
        headerName: 'Last'
      })
    ]);
    setChooserDataType('person');
    setChooserDialog(true);
  }

  // invoked from clicking `Edit` button by the org's parent field
  function onEditParentOrg() {
    setOrgEditType(OrgEditOpType.PARENT_ORG_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID',
        checkboxSelection: true,
      }),
      new GridColumn({
        field: 'name',
        sortable: true,
        filter: true,
        headerName: 'Name'
      })
    ]);
    setChooserDataType('organization');
    setChooserDialog(true);
  }

  // invoked from clicking `Add` button for Org Members
  function onAddMemberClick() {
    setOrgEditType(OrgEditOpType.MEMBERS_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID',
        checkboxSelection: true,
      }),
      new GridColumn({
        field: 'firstName',
        sortable: true,
        filter: true,
        headerName: 'First'
      }),
      new GridColumn({
        field: 'lastName',
        sortable: true,
        filter: true,
        headerName: 'Last'
      })
    ]);
    setChooserDataType('person');
    setChooserDialog(true);
  }

  const removeChosenMembers = async (members: PersonDto[]) => {
    if (members.length > 0) {      
      setShowPatchResult({ ...showPatchResult, members: true });     
      // submitPatch(OrgEditOpType.MEMBERS_REMOVE, orgState.selectedOrgState?.get()?.id || '', members.map(item => item.id));
    }
  }

  // invoked from clicking `Remove` button for Org Members
  const onRemoveMemberClick = async () => {
    if (membersGridApi?.getSelectedRows() && membersGridApi.getSelectedRows().length > 0) {
      removeActionInitiated((args: any) => { removeChosenMembers(args) }, membersGridApi.getSelectedRows());
    } 
  }

  // invoked from clicking `Remove` on the org's leader entry
  const onClearOrgLeader = async () => {
    // setShowPatchResult({ ...showPatchResult, leader: true });   
    // submitPatch(OrgEditOpType.LEADER_REMOVE, orgState.selectedOrgState.get().id || '', null);
    removeLeader();
  }

  // invoked from clicking `Remove` on the org's parent entry
  const onClearParentOrg = async () => {    
    // setShowPatchResult({ ...showPatchResult, parent: true });   
    // submitPatch(OrgEditOpType.PARENT_ORG_REMOVE, orgState.selectedOrgState.get().id || '', null);
    removeParentOrg();
  }

  // invoked from clicking `Add` button for Subordinate Orgs
  const onAddSubOrgClick = async () => {

    // get list of orgs, go fetch if orgs state doesn't exist yet or is empty
    if (orgState.state.get() == null || orgState.state.get().length === 0) {
      await orgState.fetchAndStoreData();
    }

    // clone the orgs list and set to the chooser items
    setOrgEditType(OrgEditOpType.SUB_ORGS_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID',
        checkboxSelection: true,
      }),
      new GridColumn({
        field: 'name',
        sortable: true,
        filter: true,
        headerName: 'Name'
      })
    ]);
    setChooserDataType('organization');
    setChooserDialog(true);
  }

  // actually sends request to remove suborgs
  const removeChosenOrgs = async (orgs: OrganizationDto[]) => {
    if (orgs.length > 0) {     
      setShowPatchResult({ ...showPatchResult, suborgs: true });     
      // submitPatch(OrgEditOpType.SUB_ORGS_REMOVE, orgState.selectedOrgState.get().id || '', orgs.map(item => item.id));
    }
  }

  // invoked from clicking `Remove` button for Subordinate Orgs
  const onRemoveSubOrgClick = async () => {
    if (subOrgsGridApi?.getSelectedRows() && subOrgsGridApi.getSelectedRows().length > 0) {
      removeActionInitiated((args: any) => { removeChosenOrgs(args) }, subOrgsGridApi.getSelectedRows())
    }
  }

  // a tabular row in the Chooser dialog was clicked, store it to some temp state
  const chooserRowClicked = async (event: RowClickedEvent) => {
    setChooserChosenRow(event);
  }

  // user cancelled out of the choose dialog, close it and clean row state
  const chooserDialogClose = () => {
    setChooserChosenRow(undefined);
    setChooserDialog(false);
    selectedChooserRows.set([]);
  }

  function setNewLeader(): void {
    if (selectedChooserRows.get().length !== 1) {
      throw new Error('Error setting new leader state. Length must be 1');
    }

    const newLeader = {
      ...selectedChooserRows.get()[0] as PersonWithDetails
    };

    formState.leader.set(newLeader);

    formStateExtended.leader.set({
      removed: false,
      newLeader
    });
  }

  function removeLeader(): void {
    formStateExtended.leader.set({
      removed: true,
      newLeader: undefined
    });

    formState.leader.set(undefined);
  }

  function setNewParentOrg(): void {
    if (selectedChooserRows.get().length !== 1) {
      throw new Error('Error setting new parent org state. Length must be 1');
    }

    const newParent = {
      ...selectedChooserRows.get()[0] as OrgWithDetails
    };

    formState.parentOrganization.set(newParent);

    formStateExtended.parentOrg.set({
      removed: false,
      newParent
    });
  }

  function removeParentOrg(): void {
    formStateExtended.parentOrg.set({
      removed: true,
      newParent: undefined
    });

    formState.parentOrganization.set(undefined);
  }

  function setNewMembers(): void {
    const newMembers = (selectedChooserRows.get() as PersonWithDetails[]).map(item => {
      return {
        ...item
      };
    });

    formStateExtended.members.toAdd.merge(newMembers);

    formState.members.merge(newMembers);

    /**
     * When adding new members, it will reset the checked state
     * for the members in the grid. As a result, reset the members
     * for removal state to nothing.
     */
    organizationMembersForRemoval.set([]);
  }

  function removeMembers(): void {
    const removedMembers = organizationMembersForRemoval.get().map(item => {
      return {
        ...item
      };
    });

    formStateExtended.members.toRemove.merge(removedMembers);

    // Remove members from formState
    removedMembers.forEach(removedMember => {
      formState.members.ornull?.find(member => member.id.get() === removedMember.id)?.set(none);
    });

    organizationMembersForRemoval.set([]);
  }

  function setNewSubOrgs(): void {
    const newSubOrgs = (selectedChooserRows.get() as OrganizationDto[]).map(item => {
      return {
        ...item
      };
    });

    formStateExtended.subOrgs.toAdd.merge(newSubOrgs);

    formState.subordinateOrganizations.merge(newSubOrgs);

    /**
     * When adding new sub orgs, it will reset the checked state
     * for the sub orgs in the grid. As a result, reset the sub orgs
     * for removal state to nothing.
     */
    organizationSubOrgsForRemoval.set([]);
  }

  function removeSubOrgs(): void {
    const removedSubOrgs = organizationSubOrgsForRemoval.get().map(item => {
      return {
        ...item
      };
    });

    formStateExtended.subOrgs.toRemove.merge(removedSubOrgs);

    // Remove items from formState
    removedSubOrgs.forEach(removedSubOrg => {
      formState.subordinateOrganizations.ornull?.find(subOrg => subOrg.id.get() === removedSubOrg.id)?.set(none);
    });

    organizationMembersForRemoval.set([]);
  }

  // user chose OK (confirmed the action) to do, chooser dialog will be implicitly closed
  function chooserDialogConfirmed() {
    switch (orgEditType) {
      case OrgEditOpType.LEADER_EDIT:
        setNewLeader();
        break;
      case OrgEditOpType.MEMBERS_EDIT:
        setNewMembers();
        break;
      case OrgEditOpType.SUB_ORGS_EDIT:
        setNewSubOrgs();
        break;
      case OrgEditOpType.PARENT_ORG_EDIT:
        setNewParentOrg();
        break;
      default:
        break;
    }

    chooserDialogClose();
  }

  // close remove attribute confirm dialog
  const confirmDialogClose = () => {
    setRemoveAction({ data: null, func: () => true});
    setOrgEditType(OrgEditOpType.NONE);
    setShowConfirmDialog(false);
  }

  const confirmDialogAffirmed = () => {
    removeAction.func(removeAction.data);  // action confirmed, call remove handler
    confirmDialogClose();
  }

  // some remove button was pushed... set appropriate states and show confirm dialog
  const removeActionInitiated = (func: any, arg: any) => {
    setRemoveAction({ data: arg, func: func });
    setShowConfirmDialog(true);
  }

  const selectedChooserRows = useHookstate<PersonDto[] | OrganizationDto[]>([]);
  function onChooserRowSelected(data: PersonDto | OrganizationDto, selectionEvent: 'selected' | 'unselected'): void {
    if (orgEditType === OrgEditOpType.MEMBERS_EDIT || orgEditType === OrgEditOpType.LEADER_EDIT) {
      if (selectionEvent === 'selected') {
        selectedChooserRows[selectedChooserRows.length].set(data);
      } else {
        (selectedChooserRows as State<PersonDto[]>).find(obj => obj.id.get() === data.id)?.set(none);
      }
    } else {
      if (selectionEvent === 'selected') {
        selectedChooserRows[selectedChooserRows.length].set(data);
      } else {
        (selectedChooserRows as State<OrganizationDto[]>).find(obj => obj.id.get() === data.id)?.set(none);
      }
    }
  }

  const organizationMembersForRemoval = useHookstate<PersonDto[]>([]);
  function onOrganizationMembersRowSelection(data: PersonDto, selectedEvent: 'selected' | 'unselected'): void {
    if (selectedEvent === 'selected') {
      organizationMembersForRemoval[organizationMembersForRemoval.length].set(data);
    } else {
      organizationMembersForRemoval.find(item => item.id.get() === data.id)?.set(none);
    }
  }

  const organizationSubOrgsForRemoval = useHookstate<OrganizationDto[]>([]);
  function onOrganizationSubOrgsRowSelection(data: OrganizationDto, selectedEvent: 'selected' | 'unselected'): void {
    if (selectedEvent === 'selected') {
      organizationSubOrgsForRemoval[organizationSubOrgsForRemoval.length].set(data);
    } else {
      organizationSubOrgsForRemoval.find(item => item.id.get() === data.id)?.set(none);
    }
  }

  function getIdsToExclude(chooserDataType: 'person' | 'organization'): string[] {
    if (chooserDataType === 'person') {
      const ids = formState.members.get()?.map(member => member.id);
      return ids && ids.length > 0 ? ids as string[] : [];
    }

    return [];
  }

  return (
      <div className="organization-edit-form">
        <Form onSubmit={submitForm}>
          <FormGroup labelName="orgName" labelText="Organization Name"
                     isError={Touched(formState.name).touched() && Validation(formState.name).invalid()}
                     errorMessages={Validation(formState.name).errors()
                         .map(validationError =>validationError.message)}
                      required
          >
            <TextInput id="orgName" name="orgName" type="text"
            value={formState.name.get() ?? ''}
              error={Touched(formState.name).touched() && Validation(formState.name).invalid()}
              onChange={(event) => { setOrgEditType(OrgEditOpType.OTHER); formState.name.set(event.target.value); }}
              disabled={isFormDisabled()}
            />
          </FormGroup>         
          <FormGroup labelName="branch" labelText="Branch" required>
            <Select id="branch" name="branch" data-testid="branchType"
            value={formState.branchType.get() ?? ''}
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
                     required
          >
            <Select id="type" name="type" data-testid="orgType"
            value={formState.orgType.get() ?? ''}
                    onChange={onTypeChange}
                    disabled={isFormDisabled()}
            >
              {
                Object.values(OrganizationDtoOrgTypeEnum).map((typeName) => {
                  return <option key={typeName} value={typeName}>{typeName}</option>
                })
              }
            </Select>
            <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                                  errorMessage={props.formErrors?.general || ''}
                                  showErrorMessage={props.formErrors?.general != null}
                                  showSuccessMessage={props.successAction != null && props.successAction?.success}
                                  showCloseButton={true}
                                  onCloseClicked={props.onClose} />  
            {props.successAction == null && 
              <SubmitActions formActionType={props.formActionType}
                            onCancel={props.onClose}
                            onSubmit={submitForm}
                            isFormValid={Validation(formState).valid()}
                            isFormModified={isFormModified()}
                            isFormSubmitting={props.isSubmitting}
              />
            }
          </FormGroup>
          {
            props.formActionType === FormActionType.UPDATE ?
              <>
                <hr/>
                {/* Edit/Remove Org Leader Section */}
                <FormGroup labelName="leaderName" labelText="Leader">
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TextInput id="leaderName" name="leader" type="text" data-testid='org-leader-name'
                      value={resolveLeaderName()}
                      disabled={true}
                    />
                    <Button data-testid='change-org-leader__btn' unstyled type="button" onClick={onEditLeaderClick}>
                      Change
                    </Button>
                    <Button data-testid='remove-org-leader__btn' 
                      unstyled 
                      type="button" 
                    disabled={formState.leader.get() == null}
                      onClick={() => { resolveLeaderName() !== '' && removeActionInitiated(() => { onClearOrgLeader() }, null) }}
                    >
                      Remove
                    </Button>
                    <input type='hidden' name='chosen-person-row' data-testid='chosen-person-row' value={chooserChosenRow?.data?.firstName || ''} />
                  </div>

                  {/* used for testing only */}
                  <div style={{display: 'none'}}>
                  <TextInput id="hidden-selected-item" name='chosen-row' type="text" data-testid='org-row-selection'
                        value={chooserChosenRow?.data?.firstName || ''}
                        disabled={true}
                      />
                  </div>
                  {
                    showPatchResult.leader &&  (orgEditType === OrgEditOpType.LEADER_EDIT || orgEditType === OrgEditOpType.LEADER_REMOVE) ?
                      <div>
                        <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={(props.successAction != null && props.successAction?.success)}
                               showCloseButton={false}
                               onCloseClicked={props.onClose} /> 
                      </div>
                  :
                     null
                  }
                </FormGroup> 

                {/* Edit/Remove Parent Org Section */}
                <FormGroup labelName="parentOrg" labelText="Parent Organization">
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TextInput id="parentOrg" name="parentOrg" type="text" data-testid='org-parent-name'
                    value={formState.parentOrganization.get()?.name ?? ''}
                      disabled={true}
                    />
                    <Button data-testid='change-org-parent__btn' unstyled type="button" onClick={onEditParentOrg}>
                      Change
                    </Button>
                    <Button 
                      data-testid='remove-org-parent__btn' 
                      unstyled 
                      type="button" 
                    onClick={() => { formState.parentOrganization.get()?.name && removeActionInitiated(() => { onClearParentOrg() }, null) }}
                    >
                      Remove
                    </Button>
                  </div>                  
                  {
                  showPatchResult.parent && (orgEditType === OrgEditOpType.PARENT_ORG_EDIT || orgEditType === OrgEditOpType.PARENT_ORG_REMOVE) &&
                  <div>
                    <SuccessErrorMessage
                      successMessage={props.successAction?.successMsg}
                      errorMessage={props.formErrors?.general || ''}
                      showErrorMessage={props.formErrors?.general != null}
                      showSuccessMessage={(props.successAction != null && props.successAction?.success)}
                      showCloseButton={false}
                      onCloseClicked={props.onClose}
                    />
                  </div>
                  }

                <input type='hidden' name='chosen-parent-row' data-testid='chosen-parent-row' value={chooserChosenRow?.data?.name || ''} />
                </FormGroup> 

                {/* Add/Remove Org Members Section */}
              <FormGroup labelName="membersList" labelText={`Organization Members (${formState.members.get()?.length || 0})`} >
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
                    <Button 
                      style={{marginTop: 0}} 
                      data-testid='org-member-remove-selected__btn' 
                      unstyled 
                      type="button" 
                      onClick={removeMembers}
                    >
                      Remove
                    </Button>
                  </div>
                  {
                    showPatchResult.members && (orgEditType === OrgEditOpType.MEMBERS_EDIT || orgEditType === OrgEditOpType.MEMBERS_REMOVE) ?
                      <div>
                        <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={(props.successAction != null && props.successAction?.success)}
                               showCloseButton={false}
                               onCloseClicked={props.onClose} /> 
                      </div>
                  :
                     null
                  }
                  <Grid
                  onGridReady={(event: GridApi | undefined) => setMembersGridApi(event)}
                  rowSelection='multiple'
                  height="300px"
                  data-testid="membersList"
                  data={formState.members.get() || []}
                  columns={[
                    new GridColumn({
                      field: 'lastName',
                      sortable: true,
                      filter: true,
                      headerName: 'Last',
                      checkboxSelection: true,
                      headerCheckboxSelection: true,
                    }),
                    new GridColumn({
                      field: 'firstName',
                      sortable: true,
                      filter: true,
                      headerName: 'First'
                    }),
                  ]}
                  rowClass="ag-grid--row-pointer"
                  onRowSelected={onOrganizationMembersRowSelection}
                  suppressRowClickSelection
                  />                  
                </FormGroup>

                {/* Add/Remove Org Subordinate Orgs Section */}
              <FormGroup labelName="subOrgsList" labelText={`Subordinate Organizations  (${formState.subordinateOrganizations.get()?.length || 0})`}>
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
                    <Button 
                      style={{marginTop: 0}} 
                      data-testid='org-suborg-remove-selected__btn' 
                      unstyled type="button" 
                      onClick={removeSubOrgs}
                    >
                      Remove
                    </Button>
                  </div>
                  {
                    showPatchResult.suborgs && (orgEditType === OrgEditOpType.SUB_ORGS_EDIT || orgEditType === OrgEditOpType.SUB_ORGS_REMOVE) ?
                      <div>
                        <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={(props.successAction != null && props.successAction?.success)}
                               showCloseButton={false}
                               onCloseClicked={props.onClose} /> 
                      </div>
                  :
                     null
                  }
                  <Grid
                      onGridReady={(event: GridApi | undefined) => setSubOrgsGridApi(event)}
                      rowSelection='multiple'
                      height="300px"
                      data-testid="subOrgsList"
                      data={formState.subordinateOrganizations.get() || []}
                      columns={[
                        new GridColumn({
                          field: 'name',
                          sortable: true,
                          filter: true,
                          headerName: 'Name',
                          checkboxSelection: true,
                          headerCheckboxSelection: true,
                        }),
                      ]}
                      rowClass="ag-grid--row-pointer"
                      suppressRowClickSelection
                      onRowSelected={onOrganizationSubOrgsRowSelection}
                  />
                </FormGroup>
              </>
            :
              null
          }           
        </Form>
        {
          props.formActionType === FormActionType.UPDATE ?        
            <div className="submit-actions button-container">
              <Button
                  type="submit"
                  className="button-container__submit"       
                  onClick={props.onClose}      
                  style={{marginTop: '10px'}}
              >            
                  Close
              </Button>
            </div>
          :
            null
        }
        <Modal
          show={showChooserDialog}
          headerComponent={<ModalTitle title="Choose Entry" />}
          footerComponent={(
            <div className={'modal-footer-submit'}>
              <Button type="button" data-testid='chooser-cancel__btn' className="add-app-client__btn" onClick={chooserDialogClose}>
                Cancel
              </Button>
              <Button type="button" data-testid='chooser-ok__btn' className="add-app-client__btn" onClick={chooserDialogConfirmed} disabled={selectedChooserRows.length === 0}>
                Commit
              </Button>
            </div>
          )}
          onHide={() => setChooserDialog(false)}
          height="auto"
          width="30%"
        >
        <InfiniteScrollGrid
          height='300px'
          columns={chooserDataColumns}
          rowClass='ag-grid--row-pointer'
          rowSelection={orgEditType === OrgEditOpType.MEMBERS_EDIT || orgEditType === OrgEditOpType.SUB_ORGS_EDIT ? 'multiple' : 'single'}
          datasource={orgState.createDatasource(chooserDataType, getIdsToExclude(chooserDataType))}
          onRowClicked={chooserRowClicked}
          className='item-chooser__grid'
          suppressRowClickSelection
          getRowNodeId={function (item) { return item.id }}
          onRowSelected={onChooserRowSelected}
        />
        </Modal>
        <Modal
          show={showConfirmDialog}
          headerComponent={<ModalTitle title="Confirm Remove" />}
          footerComponent={(
            <div className={'modal-footer-submit'}>
              <Button type="button" data-testid='remove-cancel__btn' className="add-app-client__btn" secondary onClick={confirmDialogClose}>
                No
              </Button>
              <Button type="button" data-testid='remove-confirm-ok__btn' className="add-app-client__btn" secondary onClick={confirmDialogAffirmed}>
                Yes
              </Button>
            </div>
          )}
          onHide={() => setShowConfirmDialog(false)}
          height="auto"
          width="30%"
          className={'org-member-editor-modal'}
        >
        Are you sure you want to remove selected entity?
        </Modal>
      </div>
  );
}

export default OrganizationEditForm;
