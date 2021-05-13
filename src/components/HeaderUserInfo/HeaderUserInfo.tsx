import { State, useHookstate } from '@hookstate/core';
import React, {useEffect, useMemo} from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { PersonDto } from '../../openapi';
import { usePersonState } from '../../state/person/person-state';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';
import ModalTitle from '../Modal/ModalTitle';
import HeaderUserEditor from './HeaderUserEditor';
import './HeaderUserInfo.scss';
import {HeaderUserInfoProps} from './HeaderUserInfoProps';

export interface UserEditorState {
  isOpen: boolean;
  data: State<PersonDto>;
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
    data: personState.currentUserState
  });

  function userEditorSubmitModal() {
    userEditorState.merge({
      isOpen: false
    });
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
          <Dropdown.Divider/>
            <a className="d-flex justify-content-center header-user-info__edit" href="#" onClick={() => userEditorState.isOpen.set(true) }>Edit Info</a>
        </Dropdown.Menu>
      </Dropdown>
      <Modal
        headerComponent={<ModalTitle title="User Editor" />}
        footerComponent={<ModalFooterSubmit
          onSubmit={userEditorSubmitModal}
          onCancel={userEditorSubmitModal}
          submitText="Done"
        />}
        show={userEditorState.isOpen.get()}
        onHide={userEditorSubmitModal}
        width="auto"
        height="auto"
      >
        <HeaderUserEditor
          editorState = {userEditorState}
        />
      </Modal>
    </div>
  );
}

export default HeaderUserInfo;
