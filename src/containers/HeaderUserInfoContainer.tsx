import React, {useEffect} from 'react';
import {useUserInfoState} from '../state/user/user-info-state';
import HeaderUserInfo from '../components/HeaderUserInfo/HeaderUserInfo';

function HeaderUserInfoContainer() {
  const state = useUserInfoState();

  useEffect(() => {
    const cancellableFetch = state.fetchAndStoreUserInfo();

    /**
     * Cancel any pending request
     */
    return function cleanup() {
      cancellableFetch.cancelTokenSource.cancel();
    }
  }, []);

  return (
      <HeaderUserInfo userInfo={state?.userInfo}/>
  );
}

export default HeaderUserInfoContainer;
