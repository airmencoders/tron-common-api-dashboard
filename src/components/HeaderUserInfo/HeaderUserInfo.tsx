import React, {useMemo} from 'react';
import { Dropdown } from 'react-bootstrap';
import Button from '../Button/Button';
import './HeaderUserInfo.scss';
import {HeaderUserInfoProps} from './HeaderUserInfoProps';


function HeaderUserInfo({userInfo}: HeaderUserInfoProps) {

  const userInitials = useMemo(() => {
    if (userInfo != null) {
      return `${userInfo.givenName?.[0]}${userInfo.familyName?.[0]}`
    }
    return '--';
  }, [userInfo]);

  return (
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
        </Dropdown.Menu>
      </Dropdown>
  );
}

export default HeaderUserInfo;
