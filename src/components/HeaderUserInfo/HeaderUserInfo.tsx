import React, {useEffect, useMemo} from 'react';
import { useHookstate } from '@hookstate/core';
import { Dropdown } from 'react-bootstrap';
import { PersonDto } from '../../openapi';
import { usePersonState } from '../../state/person/person-state';
import Modal from '../Modal/Modal';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';
import ModalTitle from '../Modal/ModalTitle';
import Spinner from '../Spinner/Spinner';
import { ToastType } from '../Toast/ToastUtils/toast-type';
import { createTextToast } from '../Toast/ToastUtils/ToastUtils';
import { HeaderUserEditorWithLoading } from './HeaderUserEditor';
import './HeaderUserInfo.scss';
import {HeaderUserInfoProps} from './HeaderUserInfoProps';
import {useUserInfoState} from '../../state/user/user-info-state';
import { isDataRequestCancelError } from '../../utils/cancellable-data-request';
import { CancelTokenSource } from 'axios';

/**
 * @member isOpen Tracks the state of the modal
 * @member currentUserState Holds the Person record state to be edited
 * @member original Holds the original Person record
 * @member errorMessage The error message if a request to update Person record fails
 * @member disableSubmit Disables the modal submit button when set to true
 * @member isLoading Tracks loading state of data. Set to true only for subsequent refreshes of the data.
 * @member isLoadingInitial Tracks loading state of initial data. Set to true only for the initial load of data.
 */
export interface UserEditorState {
  isOpen: boolean;
  currentUserState: PersonDto;
  errorMessage: string;
  disableSubmit: boolean;
  original?: PersonDto;
  isLoading: boolean;
  isLoadingInitial: boolean;
  cancelTokenSource?: CancelTokenSource;
}

function HeaderUserInfo({userInfo}: HeaderUserInfoProps) {
  const userInitials = useMemo(() => {
    if (userInfo != null) {
      return `${userInfo.givenName?.[0]}${userInfo.familyName?.[0]}`
    }
    return '--';
  }, [userInfo]);

  const personState = usePersonState();
  const userInfoState = useUserInfoState();
  const userEditorState = useHookstate<UserEditorState>({
    isOpen: false,
    currentUserState: {},
    errorMessage: '',
    disableSubmit: false,
    isLoading: false,
    isLoadingInitial: false,
    cancelTokenSource: undefined
  });

  useEffect(() => {
    /**
     * Try to fetch the Person record on load first.
     * This is to identify if the Person has an existing
     * record in the database. This is used to determine if
     * "Edit Person Record" should be shown in the userinfo header dropdown.
     */
    userEditorState.isLoadingInitial.set(true);
    const cancellableRequest = userInfoState.getExistingPersonForUser();
    cancellableRequest.axiosPromise()
      .then(response => {
        userEditorState.merge({
          currentUserState: response.data,
          isLoadingInitial: false
        });
      })
      .catch(error => {
        if (!isDataRequestCancelError(error)) {
          userEditorState.isLoadingInitial.set(false);
        }
      });

    return function cleanup() {
      cancellableRequest.cancelTokenSource.cancel();
    }
  }, []);

  async function userEditorSubmitModal() {
    try {
      userEditorState.disableSubmit.set(true);
      await personState.sendSelfUpdate(userEditorState.currentUserState.get());

      userEditorCloseHandler();
      createTextToast(ToastType.SUCCESS, 'Successfully updated Person Record.');
    } catch (error) {
      userEditorState.merge({
        errorMessage: error.message
      });
    }
  }

  function userEditorCloseHandler() {
    // Cancel the request in the event it is still pending
    userEditorState.cancelTokenSource.get()?.cancel();

    userEditorState.merge({
      isOpen: false,
      errorMessage: '',
      disableSubmit: false,
      isLoading: false,
      cancelTokenSource: undefined
    });
  }

  async function onHeaderClick() {
    if (userInfo?.email == null)
      return;

    try {
      const cancellablePersonRequest = userInfoState.getExistingPersonForUser();

      userEditorState.merge({
        isOpen: true,
        isLoading: true,
        cancelTokenSource: cancellablePersonRequest.cancelTokenSource
      });

      /**
       * Refresh the Person record to get most up to date info.
       */
      const personRequest = await cancellablePersonRequest.axiosPromise();
      const person = personRequest.data;

      userEditorState.merge({
        currentUserState: person,
        original: { ...person },
        isLoading: false,
        disableSubmit: true
      });
    } catch (err) {
      if (!isDataRequestCancelError(err)) {
        createTextToast(ToastType.ERROR, 'Could not load your record.');
      }

      userEditorCloseHandler();
    }
  }

  return (
    <div>
      <Dropdown className="header-user-info">
        <Dropdown.Toggle className="header-user-info__initials" type="button">
          {userInitials}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="header-user-info__body">
            <div className="header-user-info__section-header">P1 User Info</div>
            <div className="header-user-info__user-field">
              <div className="font-italic text-muted header-user-info__label">Name</div>
              {userInfo?.name}
            </div>
            <div className="header-user-info__user-field">
              <div className="font-italic text-muted header-user-info__label">DoD ID</div>
              {userInfo?.dodId}
            </div>
            <div className="header-user-info__user-field">
              <div className="font-italic text-muted header-user-info__label">Email</div>
              {userInfo?.email}
            </div>
            <div className="header-user-info__user-field">
              <div className="font-italic text-muted header-user-info__label">Organization</div>
              {userInfo?.organization}
            </div>
          </div>
          {userEditorState.isLoadingInitial.get() ?
            <Spinner />
            :
            userEditorState.currentUserState.email.get() &&
            <div>
              <Dropdown.Divider />
              <a className="d-flex justify-content-center header-user-info__edit" href="#" onClick={onHeaderClick}>Edit Associated Record</a>
            </div>
          }
        </Dropdown.Menu>
      </Dropdown>
      <Modal
        className="user-info-modal"
        headerComponent={<ModalTitle title="Edit Person Record" />}
        footerComponent={<ModalFooterSubmit
          onSubmit={userEditorSubmitModal}
          onCancel={userEditorCloseHandler}
          disableSubmit={userEditorState.disableSubmit.get() || userEditorState.isLoading.get()}
          submitText="Update"
        />}
        show={userEditorState.isOpen.get()}
        onHide={userEditorCloseHandler}
        width="500px"
        height="auto"
      >
        <HeaderUserEditorWithLoading
          isLoading={userEditorState.isLoading.get()}
          editorState={userEditorState}
          userInitials={userInitials}
        />
      </Modal>
    </div>
  );
}

export default HeaderUserInfo;
