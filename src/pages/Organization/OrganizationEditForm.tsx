import { createState, useState } from '@hookstate/core';
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
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import '../../components/Modal/ModalFooterSubmit.scss';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../openapi/models';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { OrgEditOpType } from '../../state/organization/organization-service';
import { useOrganizationState } from '../../state/organization/organization-state';
import { usePersonState } from '../../state/person/person-state';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';


function OrganizationEditForm(props: CreateUpdateFormProps<OrganizationDto>) {
  const SELECT_ALL_TEXT = "Select All";
  const DESELECT_ALL_TEXT = "Unselect All";
  const personState = usePersonState();  // handle to the person-service and state
  const orgState = useOrganizationState();  // handle to the org-service and state
  const formState = useState(createState({...props.data})); // data from the UI form

  const [showChooserDialog, setChooserDialog] = React.useState(false); // whether to show the Chooser Dialog
  const [chooserDataItems, setChooserDataItem] = React.useState(new Array<PersonDto | OrganizationDto>());  // the data to show in Chooser dialog
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

    return isChanged;
  }

  // handles all patch changes, calls into DataCrudForm component, does its work, and then refreshes form
  const submitPatch = async (opType: OrgEditOpType, id: string, data: any) => {
    setOrgEditType(opType);
    props.onPatch && props.onPatch(opType, id, data);
    formState.set({...props.data})
  }

  // handles PUT changes, calls into DataCrudForm component
  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(formState.get());    
  }

  const isFormDisabled = ():boolean => {
    return false;
  }

  // helper to construct the leader's name 
  const resolveLeaderName = () => {
    return `${orgState.selectedOrgState.get().leader?.firstName || ''} ${orgState.selectedOrgState.get().leader?.lastName || ''}`.trim();
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
  const onEditLeaderClick = async () => {

    // get list of people, go fetch if person state doesn't exist yet
    if (personState.state.get() == null || personState.state.get().length === 0) {
      await personState.fetchAndStoreData();
    }

    // clone the people list and set to the chooser items
    setChooserDataItem([...personState.state.get()]);
    setOrgEditType(OrgEditOpType.LEADER_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID'
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
    setChooserDialog(true);
  }

  // invoked from clicking `Edit` button by the org's parent field
  const onEditParentOrg = async () => {

    // get list of orgs, go fetch if orgs state doesn't exist yet or is empty
    if (orgState.state.get() == null || orgState.state.get().length === 0) {
      await orgState.fetchAndStoreData();
    }

    // clone the orgs list and set to the chooser items
    setChooserDataItem([...orgState.state.get()]);
    setOrgEditType(OrgEditOpType.PARENT_ORG_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID'
      }),
      new GridColumn({
        field: 'name',
        sortable: true,
        filter: true,
        headerName: 'Name'
      })
    ]);
    setChooserDialog(true);
  }

  // invoked from clicking `Add` button for Org Members
  const onAddMemberClick = async () => {

    // get list of people, go fetch if person state doesn't exist yet
    if (personState.state.get() == null || personState.state.get().length === 0) {
      await personState.fetchAndStoreData();
    }

    // clone the people list and set to the chooser items
    setChooserDataItem([...personState.state.get()]);
    setOrgEditType(OrgEditOpType.MEMBERS_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID'
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
    setChooserDialog(true);
  }

  const removeChosenMembers = async (members: PersonDto[]) => {
    if (members.length > 0) {      
      setShowPatchResult({ ...showPatchResult, members: true });     
      submitPatch(OrgEditOpType.MEMBERS_REMOVE, orgState.selectedOrgState?.get()?.id || '', members.map(item => item.id));
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
    setShowPatchResult({ ...showPatchResult, leader: true });   
    submitPatch(OrgEditOpType.LEADER_REMOVE, orgState.selectedOrgState.get().id || '', null);
  }

  // invoked from clicking `Remove` on the org's parent entry
  const onClearParentOrg = async () => {    
    setShowPatchResult({ ...showPatchResult, parent: true });   
    submitPatch(OrgEditOpType.PARENT_ORG_REMOVE, orgState.selectedOrgState.get().id || '', null);
  }

  // invoked from clicking `Add` button for Subordinate Orgs
  const onAddSubOrgClick = async () => {

    // get list of orgs, go fetch if orgs state doesn't exist yet or is empty
    if (orgState.state.get() == null || orgState.state.get().length === 0) {
      await orgState.fetchAndStoreData();
    }

    // clone the orgs list and set to the chooser items
    setChooserDataItem([...orgState.state.get()]);
    setOrgEditType(OrgEditOpType.SUB_ORGS_EDIT);
    setChooserDataColumns([ 
      new GridColumn({
        field: 'id',
        sortable: true,
        filter: true,
        headerName: 'ID'
      }),
      new GridColumn({
        field: 'name',
        sortable: true,
        filter: true,
        headerName: 'Name'
      })
    ]);
    setChooserDialog(true);
  }

  // actually sends request to remove suborgs
  const removeChosenOrgs = async (orgs: OrganizationDto[]) => {
    if (orgs.length > 0) {     
      setShowPatchResult({ ...showPatchResult, suborgs: true });     
      submitPatch(OrgEditOpType.SUB_ORGS_REMOVE, orgState.selectedOrgState.get().id || '', orgs.map(item => item.id));
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
  }  

  // user chose OK (confirmed the action) to do, chooser dialog will be implicitly closed
  const chooserDialogConfirmed = async () => {

    // validate we have some kind of data to PATCH against the org
    if (chooserChosenRow !== undefined && chooserChosenRow?.data?.id) {
      switch (orgEditType) {
        case OrgEditOpType.LEADER_EDIT: 
          setShowPatchResult({ ...showPatchResult, leader: true });         
          submitPatch(OrgEditOpType.LEADER_EDIT, orgState.selectedOrgState.get().id || '', chooserChosenRow.data.id);          
          break;
        case OrgEditOpType.MEMBERS_EDIT:
          setShowPatchResult({ ...showPatchResult, members: true });        
          submitPatch(OrgEditOpType.MEMBERS_EDIT, orgState.selectedOrgState.get().id || '', chooserChosenRow.data.id);
          break;
        case OrgEditOpType.SUB_ORGS_EDIT:
          setShowPatchResult({ ...showPatchResult, suborgs: true });        
          submitPatch(OrgEditOpType.SUB_ORGS_EDIT, orgState.selectedOrgState.get().id || '', chooserChosenRow.data.id);
          break;
        case OrgEditOpType.PARENT_ORG_EDIT:
          setShowPatchResult({ ...showPatchResult, parent: true });        
          submitPatch(OrgEditOpType.PARENT_ORG_EDIT, orgState.selectedOrgState.get().id || '', chooserChosenRow.data.id);
          break;
        default:
          break;
      }
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
              defaultValue={props.data?.name || ''}
              error={Touched(formState.name).touched() && Validation(formState.name).invalid()}
              onChange={(event) => { setOrgEditType(OrgEditOpType.OTHER); formState.name.set(event.target.value); }}
              disabled={isFormDisabled()}
            />
          </FormGroup>         
          <FormGroup labelName="branch" labelText="Branch" required>
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
                     required
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
                      defaultValue={resolveLeaderName()}
                      value={resolveLeaderName()}
                      disabled={true}
                    />
                    <Button data-testid='change-org-leader__btn' unstyled type="button" onClick={onEditLeaderClick}>
                      Change
                    </Button>
                    <Button data-testid='remove-org-leader__btn' 
                      unstyled 
                      type="button" 
                      onClick={() => { resolveLeaderName() !== '' && removeActionInitiated(() => { onClearOrgLeader() }, null) }}
                    >
                      Remove
                    </Button>
                    <input type='hidden' name='chosen-person-row' data-testid='chosen-person-row' value={chooserChosenRow?.data?.firstName || ''} />
                  </div>

                  {/* used for testing only */}
                  <div style={{display: 'none'}}>
                    <TextInput id="hidden-selected-item" name='chosen-row' type="text" data-testid='org-row-selection'
                        defaultValue={chooserChosenRow?.data?.firstName || ''}
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
                      defaultValue={orgState.selectedOrgState.get().parentOrganization?.name || ''}
                      value={orgState.selectedOrgState.get().parentOrganization?.name || ''}
                      disabled={true}
                    />
                    <Button data-testid='change-org-parent__btn' unstyled type="button" onClick={onEditParentOrg}>
                      Change
                    </Button>
                    <Button 
                      data-testid='remove-org-parent__btn' 
                      unstyled 
                      type="button" 
                      onClick={ () => { orgState.selectedOrgState.get().parentOrganization?.name && removeActionInitiated(() => { onClearParentOrg() }, null) }}
                    >
                      Remove
                    </Button>
                  </div>                  
                  {
                    showPatchResult.parent && (orgEditType === OrgEditOpType.PARENT_ORG_EDIT || orgEditType === OrgEditOpType.PARENT_ORG_REMOVE) ?
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

                <input type='hidden' name='chosen-parent-row' data-testid='chosen-parent-row' value={chooserChosenRow?.data?.name || ''} />
                </FormGroup> 

                {/* Add/Remove Org Members Section */}
                <FormGroup labelName="membersList" labelText={`Organization Members (${orgState.selectedOrgState.get().members?.length || 0})`} >
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
                      onClick={() => { onRemoveMemberClick() }}
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
                      data={orgState.selectedOrgState.get().members || []}
                      columns={[
                        new GridColumn({
                          field: 'lastName',
                          sortable: true,
                          filter: true,
                          headerName: 'Last'
                        }),
                        new GridColumn({
                          field: 'firstName',
                          sortable: true,
                          filter: true,
                          headerName: 'First'
                        }),
                      ]}
                      rowClass="ag-grid--row-pointer"
                  />                  
                </FormGroup>

                {/* Add/Remove Org Subordinate Orgs Section */}
                <FormGroup labelName="subOrgsList" labelText={`Subordinate Organizations  (${orgState.selectedOrgState.get().subordinateOrganizations?.length || 0})`}>
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
                      onClick={() => { onRemoveSubOrgClick() }}
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
                      data={orgState.selectedOrgState.get().subordinateOrganizations || []}
                      columns={[
                        new GridColumn({
                          field: 'name',
                          sortable: true,
                          filter: true,
                          headerName: 'Name'
                        }),
                      ]}
                      rowClass="ag-grid--row-pointer"
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
              <Button type="button" data-testid='chooser-ok__btn' className="add-app-client__btn" onClick={chooserDialogConfirmed}>
                Commit
              </Button>
            </div>
          )}
          onHide={() => setChooserDialog(false)}
          height="auto"
          width="30%"
        >
          <ItemChooser
            items={chooserDataItems}
            columns={chooserDataColumns}
            onRowClicked={chooserRowClicked}
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
          This action takes immediate effect. Are you sure you want to remove selected entity?
        </Modal>
      </div>
  );
}

export default OrganizationEditForm;
