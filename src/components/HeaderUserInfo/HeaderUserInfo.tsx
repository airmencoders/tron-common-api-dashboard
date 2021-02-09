import React, {useMemo} from 'react';
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
      <div className="header-user-info">
        <div className="header-user-info__initials">
          {userInitials}
        </div>
      </div>
  );
}

export default HeaderUserInfo;
