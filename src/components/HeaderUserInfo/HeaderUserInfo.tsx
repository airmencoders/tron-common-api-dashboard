import { State, useHookstate } from '@hookstate/core';
import React, {useEffect, useMemo} from 'react';
import { Dropdown } from 'react-bootstrap';
import { PersonDto } from '../../openapi';
import { usePersonState } from '../../state/person/person-state';
import Modal from '../Modal/Modal';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';
import ModalTitle from '../Modal/ModalTitle';
import { ToastType } from '../Toast/ToastUtils/toast-type';
import { createTextToast } from '../Toast/ToastUtils/ToastUtils';
import HeaderUserEditor from './HeaderUserEditor';
import './HeaderUserInfo.scss';
import {HeaderUserInfoProps} from './HeaderUserInfoProps';

export interface UserEditorState {
  isOpen: boolean;
  currentUserState: State<PersonDto>;
  errorMessage: string;
  disableSubmit: boolean
}

function HeaderUserInfo({userInfo}: HeaderUserInfoProps) {
  const userInitials = useMemo(() => {
    if (userInfo != null) {
      return `${userInfo.givenName?.[0]}${userInfo.familyName?.[0]}`
    }
    return '--';
  }, [userInfo]);

  const personState = usePersonState();
  useEffect(() => {
    personState.getPersonByEmail(userInfo?.email || '');
  }, []);
  
  const userEditorState = useHookstate<UserEditorState>({
    isOpen: false,
    currentUserState: personState.currentUserState,
    errorMessage: '',
    disableSubmit: false
  });

  async function userEditorSubmitModal() {
    try {
      await personState.sendSelfUpdate(userEditorState.get().currentUserState.get());
      userEditorCloseHandler();
      createTextToast(ToastType.SUCCESS, 'Successfully updated Person Record.');
    } catch (error) {
      userEditorState.errorMessage.set(error.message);
    }
  }

  function userEditorCloseHandler() {
    personState.getPersonByEmail(userInfo?.dodId || '')
    userEditorState.merge({
      isOpen: false,
      currentUserState: personState.currentUserState,
      errorMessage: '',
      disableSubmit: false
    })
  }

  return (
    <div>
      <Dropdown className="header-user-info">
        <Dropdown.Toggle className="header-user-info__initials" type="button">
          {userInitials}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
              <div className="font-italic text-muted header-user-info__label">Name</div>
              {userInfo?.name}
          </Dropdown.Item>
          <Dropdown.Item>
            <div className="font-italic text-muted header-user-info__label">DoD ID</div>
            {userInfo?.dodId}
          </Dropdown.Item>
          <Dropdown.Item>
            <div className="font-italic text-muted header-user-info__label">Email</div>
            {userInfo?.email}
          </Dropdown.Item>
          <Dropdown.Item>
            <div className="font-italic text-muted header-user-info__label">Organization</div>
            {userInfo?.organization}
          </Dropdown.Item>
            { personState.currentUserState.email.get() &&
              <div>
                <Dropdown.Divider/>
                <a className="d-flex justify-content-center header-user-info__edit" href="#" onClick={() => userEditorState.isOpen.set(true) }>Edit Person Record</a>
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
          disableSubmit={userEditorState.disableSubmit.get()}
          submitText="Update"
        />}
        show={userEditorState.isOpen.get()}
        onHide={userEditorCloseHandler}
        width="500px"
        height="auto"
      >
        <HeaderUserEditor
          editorState = {userEditorState}
          userInitials = {userInitials}
        />
      </Modal>
    </div>
  );
}

export default HeaderUserInfo;
