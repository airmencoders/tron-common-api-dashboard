import { Downgraded, none, State, useHookstate, useState } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
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
import EditIcon from '../../icons/EditIcon';
import RemoveIcon from '../../icons/RemoveIcon';
import './OrganizationEditForm.scss';
import PlusIcon from '../../icons/PlusIcon';
import { getDefaultOrganizationEditState, OrganizationEditState } from './organization-edit-state';
import { OrganizationChooserDataType } from '../../state/organization/organization-chooser-data-type';
import { mapDataItemsToStringIds } from '../../state/data-service/data-service-utils';
import Fieldset from '../../components/forms/Fieldset/Fieldset';
import Label from '../../components/forms/Label/Label';
import TextInputWithDelete from '../../components/forms/TextInputWithDelete/TextInputWithDelete';

const personColumns = [ 
  new GridColumn({
    field: 'email',
    sortable: true,
    filter: true,
    headerName: 'Email',
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
];

const membersListColumns = [
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
]

const orgColumns = [ 
  new GridColumn({
    field: 'name',
    sortable: true,
    filter: true,
    headerName: 'Name',
    checkboxSelection: true,
  })
];

const subOrgListColumns = [
  new GridColumn({
    field: 'name',
    sortable: true,
    filter: true,
    headerName: 'Name',
    checkboxSelection: true,
    headerCheckboxSelection: true,
  }),
];

function OrganizationEditForm(props: CreateUpdateFormProps<OrganizationDtoWithDetails>) {
  const orgState = useOrganizationState();  // handle to the org-service and state
  const formState = useState({
    ...props.data,
    subordinateOrganizations: props.data?.subordinateOrganizations ? [...props.data?.subordinateOrganizations] : [],
    members: props.data?.members ? [...props.data.members] : []
  }); // data from the UI form

  const formStateExtended = useState<OrganizationEditState>(getDefaultOrganizationEditState());

  const [showChooserDialog, setChooserDialog] = React.useState(false); // whether to show the Chooser Dialog
  const [chooserDataType, setChooserDataType] = React.useState<OrganizationChooserDataType>(OrganizationChooserDataType.PERSON);  // the data to show in Chooser dialog
  const [chooserDataColumns, setChooserDataColumns] = React.useState(new Array<GridColumn>());  // the chosen row from the chooser dialog

  const [orgEditType, setOrgEditType] = React.useState(OrgEditOpType.NONE);  // what part of the org we're adding to

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false); // whether to show attribute remove confirmation
  const [removeAction, setRemoveAction] = React.useState<{ data: any, func: any }>({ data: null, func: null }); // on a remove action that is confirmed, call this function to do the removing

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
    setChooserDataColumns(personColumns);
    setChooserDataType(OrganizationChooserDataType.PERSON);
    setChooserDialog(true);
  }

  // invoked from clicking `Edit` button by the org's parent field
  function onEditParentOrg() {
    setOrgEditType(OrgEditOpType.PARENT_ORG_EDIT);
    setChooserDataColumns(orgColumns);
    setChooserDataType(OrganizationChooserDataType.ORGANIZATION);
    setChooserDialog(true);
  }

  // invoked from clicking `Add` button for Org Members
  function onAddMemberClick() {
    setOrgEditType(OrgEditOpType.MEMBERS_EDIT);
    setChooserDataColumns(personColumns);
    setChooserDataType(OrganizationChooserDataType.PERSON);
    setChooserDialog(true);
  }

  // invoked from clicking `Add` button for Subordinate Orgs
  const onAddSubOrgClick = () => {
    setOrgEditType(OrgEditOpType.SUB_ORGS_EDIT);
    setChooserDataColumns(orgColumns);
    setChooserDataType(OrganizationChooserDataType.ORGANIZATION);
    setChooserDialog(true);
  }

  // user cancelled out of the choose dialog, close it and clean row state
  const chooserDialogClose = () => {
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
    const newMembers = (selectedChooserRows.attach(Downgraded).get() as PersonWithDetails[]);

    formStateExtended.members.toAdd.merge(newMembers);

    // Check to make sure if we add to toAdd list that we remove them from toRemove list
    newMembers.forEach(member => {
      formStateExtended.members.toRemove.find(toRemove => member.id === toRemove.id.get())?.set(none);
    });

    formState.members.merge(newMembers);

    /**
     * When adding new members, it will reset the checked state
     * for the members in the grid. As a result, reset the members
     * for removal state to nothing.
     */
    organizationMembersForRemoval.set([]);
  }

  function removeMembers(): void {
    const removedMembers = (organizationMembersForRemoval.attach(Downgraded).get() as PersonWithDetails[]).map(item => {
      return {
        ...item
      };
    });

    formStateExtended.members.toRemove.merge(removedMembers);

    // Remove members from formState & toAdd state
    removedMembers.forEach(removedMember => {
      formState.members.ornull?.find(member => member.id.get() === removedMember.id)?.set(none);
      formStateExtended.members.toAdd.find(member => member.id.get() === removedMember.id)?.set(none);
    });

    organizationMembersForRemoval.set([]);
  }

  function setNewSubOrgs(): void {
    const newSubOrgs = (selectedChooserRows.attach(Downgraded).get() as OrganizationDto[]);

    formStateExtended.subOrgs.toAdd.merge(newSubOrgs);

    // Check to make sure if we add to toAdd list that we remove them from toRemove list
    newSubOrgs.forEach(subOrg => {
      formStateExtended.subOrgs.toRemove.find(toRemove => subOrg.id === toRemove.id.get())?.set(none);
    });

    formState.subordinateOrganizations.merge(newSubOrgs);

    /**
     * When adding new sub orgs, it will reset the checked state
     * for the sub orgs in the grid. As a result, reset the sub orgs
     * for removal state to nothing.
     */
    organizationSubOrgsForRemoval.set([]);
  }

  function removeSubOrgs(): void {
    const toBeRemoved = organizationSubOrgsForRemoval.attach(Downgraded).get();

    formStateExtended.subOrgs.toRemove.merge(toBeRemoved);

    // Remove items from formState & toAdd 
    toBeRemoved.forEach(removedSubOrg => {
      formState.subordinateOrganizations.ornull?.find(subOrg => subOrg.id.get() === removedSubOrg.id)?.set(none);
      formStateExtended.subOrgs.toAdd.find(subOrg => subOrg.id.get() === removedSubOrg.id)?.set(none);
    });

    organizationSubOrgsForRemoval.set([]);
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

  /**
   * Generates the title of the Chooser modal based on the edit type
   * @returns the title
   */
  function chooserDialogTitle(): string {
    let title = '';
    switch (orgEditType) {
      case OrgEditOpType.LEADER_EDIT:
        title = 'Leader';
        break;
      case OrgEditOpType.MEMBERS_EDIT:
        title = 'Members';
        break;
      case OrgEditOpType.SUB_ORGS_EDIT:
        title = 'Subordinate Organizations';
        break;
      case OrgEditOpType.PARENT_ORG_EDIT:
        title = 'Parent Organization';
        break;
      default:
        title = 'Choose Entry';
        break;
    }

    return title;
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

  /**
   *
   * @param dataType type of data being passed to Chooser
   * @returns list of string ids to exclude
   */
  function getIdsToExclude(dataType: OrganizationChooserDataType): string[] {
    let ids: string[] = [];

    if (dataType === OrganizationChooserDataType.PERSON) {
      ids = mapDataItemsToStringIds(formState.members.get());
    } else {
      ids = mapDataItemsToStringIds(formState.subordinateOrganizations.get());

      // Add the organization that is being edited as an exluded item
      // Organization cannot be a subordinate org of itself
      const selfOrgId = formState.get().id;
      if (selfOrgId != null) {
        ids.push(selfOrgId);
      }
    }

    return ids;
  }

  return (
    <div className="organization-edit-form">
      <Form onSubmit={submitForm}>
        <FormGroup
          labelName="orgName" labelText="Organization Name"
          isError={Touched(formState.name).touched() && Validation(formState.name).invalid()}
          errorMessages={Validation(formState.name).errors()
            .map(validationError => validationError.message)}
          required
        >
          <TextInput
            id="orgName" name="orgName" type="text"
            value={formState.name.get() ?? ''}
            error={Touched(formState.name).touched() && Validation(formState.name).invalid()}
            onChange={(event) => { setOrgEditType(OrgEditOpType.OTHER); formState.name.set(event.target.value); }}
            disabled={isFormDisabled()}
          />
        </FormGroup>
        <FormGroup labelName="branch" labelText="Branch" required>
          <Select
            id="branch" name="branch" data-testid="branchType"
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
        <FormGroup
          labelName="type" labelText="Type"
          errorMessages={Validation(formState.orgType).errors()
            .map(validationError => validationError.message)}
          required
        >
          <Select
            id="type" name="type" data-testid="orgType"
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
        </FormGroup>
        <>
          {/* Edit/Remove Org Leader Section */}
          <FormGroup labelName="leaderName" labelText="Leader">
            <div className="organization-edit-form__input-actions">
              <TextInputWithDelete
                id="leaderName"
                name="leader"
                type="text"
                data-testid='org-leader-name'
                value={resolveLeaderName()}
                disabled={true}
                onDeleteClickHandler={() => { resolveLeaderName() !== '' && removeActionInitiated(() => { removeLeader() }, null) }}
                deleteButtonTitle="Remove Leader"
                className="input-actions__remove-input"
              />

              <Button
                data-testid='change-org-leader__btn'
                disableMobileFullWidth
                type={'button'}
                onClick={onEditLeaderClick}
                unstyled
                className="input-actions__icon-btn"
              >
                <EditIcon iconTitle="Change Leader" size={1.5} />
              </Button>
            </div>
          </FormGroup>

          {/* Edit/Remove Parent Org Section */}
          <FormGroup labelName="parentOrg" labelText="Parent Organization">
            <div className="organization-edit-form__input-actions">
              <TextInputWithDelete
                id="parentOrg"
                name="parentOrg"
                type="text"
                data-testid='org-parent-name'
                value={formState.parentOrganization.get()?.name ?? ''}
                disabled={true}
                onDeleteClickHandler={() => { formState.parentOrganization.get()?.name && removeActionInitiated(() => { removeParentOrg() }, null) }}
                deleteButtonTitle="Remove Parent Organization"
                className="input-actions__remove-input"
              />

              <Button
                data-testid='change-org-parent__btn'
                disableMobileFullWidth
                type={'button'}
                onClick={onEditParentOrg}
                unstyled
                className="input-actions__icon-btn"
              >
                <EditIcon iconTitle="Change Parent Organization" size={1.5} />
              </Button>
            </div>
          </FormGroup>

          {/* Add/Remove Org Members Section */}
          <Fieldset>
            <Label htmlFor='membersList'>
              {`Organization Members (${formState.members.get()?.length || 0})`}
              <div className="organization-edit-form__input-actions organization-edit-form__input-actions--grid">
                <Button
                  data-testid='org-add-member__btn'
                  disableMobileFullWidth
                  type={'button'}
                  onClick={onAddMemberClick}
                  unstyled
                  className="input-actions__icon-btn"
                >
                  <PlusIcon iconTitle="Add Members" size={1.5} />
                </Button>

                <Button
                  data-testid='org-member-remove-selected__btn'
                  disableMobileFullWidth
                  type={'button'}
                  disabled={organizationMembersForRemoval.get().length === 0}
                  onClick={removeMembers}
                  unstyled
                  transparentOnDisabled
                  className="input-actions__icon-btn"
                >
                  <RemoveIcon iconTitle="Remove Selected Members" disabled={organizationMembersForRemoval.get().length === 0} size={1.5} />
                </Button>
              </div>
            </Label>

            <Grid
              rowSelection='multiple'
              height="300px"
              data-testid="membersList"
              data={formState.members.attach(Downgraded).get() || []}
              columns={membersListColumns}
              rowClass="ag-grid--row-pointer"
              onRowSelected={onOrganizationMembersRowSelection}
              // suppressRowClickSelection
            />
          </Fieldset>

          {/* Add/Remove Org Subordinate Orgs Section */}
          <Fieldset>
            <Label htmlFor="subOrgsList">
              {`Subordinate Organizations  (${formState.subordinateOrganizations.get()?.length || 0})`}
              <div className="organization-edit-form__input-actions organization-edit-form__input-actions--grid">
                <Button
                  data-testid='org-add-suborg__btn'
                  disableMobileFullWidth
                  type={'button'}
                  onClick={onAddSubOrgClick}
                  unstyled
                  className="input-actions__icon-btn"
                >
                  <PlusIcon iconTitle="Add Sub Orgs" size={1.5} />
                </Button>

                <Button
                  data-testid='org-suborg-remove-selected__btn'
                  disableMobileFullWidth
                  type={'button'}
                  disabled={organizationSubOrgsForRemoval.get().length === 0}
                  onClick={removeSubOrgs}
                  unstyled
                  transparentOnDisabled
                  className="input-actions__icon-btn"
                >
                  <RemoveIcon iconTitle="Remove Selected Sub Orgs" disabled={organizationSubOrgsForRemoval.get().length === 0} size={1.5} />
                </Button>
              </div>
            </Label>

            <Grid
              rowSelection='multiple'
              height="300px"
              data-testid="subOrgsList"
              data={formState.subordinateOrganizations.attach(Downgraded).get() || []}
              columns={subOrgListColumns}
              rowClass="ag-grid--row-pointer"
              // suppressRowClickSelection
              onRowSelected={onOrganizationSubOrgsRowSelection}
            />
          </Fieldset>
        </>

        <SuccessErrorMessage
          successMessage={props.successAction?.successMsg}
          errorMessage={props.formErrors?.general || ''}
          showErrorMessage={props.formErrors?.general != null}
          showSuccessMessage={props.successAction != null && props.successAction?.success}
          showCloseButton={true}
          onCloseClicked={props.onClose}
        />
        {props.successAction == null &&
          <SubmitActions
            formActionType={props.formActionType}
            onCancel={props.onClose}
            onSubmit={submitForm}
            isFormValid={Validation(formState).valid()}
            isFormModified={isFormModified()}
            isFormSubmitting={props.isSubmitting}
          />
        }
      </Form>

      <Modal
        show={showChooserDialog}
        headerComponent={<ModalTitle title={chooserDialogTitle()} />}
        footerComponent={(
          <div className={'modal-footer-submit'}>
            <Button type="button" data-testid='chooser-cancel__btn' className="add-app-client__btn" onClick={chooserDialogClose}>
              Cancel
            </Button>
            <Button type="button" data-testid='chooser-ok__btn' className="add-app-client__btn" onClick={chooserDialogConfirmed} disabled={selectedChooserRows.length === 0}>
              Select
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
          className='item-chooser__grid'
          // suppressRowClickSelection
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
