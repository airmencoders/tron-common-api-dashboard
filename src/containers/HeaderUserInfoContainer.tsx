import React, {useEffect} from 'react';
import {useUserInfoState} from '../state/user/user-info-state';
import HeaderUserInfo from '../components/HeaderUserInfo/HeaderUserInfo';

function HeaderUserInfoContainer() {
  const state = useUserInfoState();

  useEffect(() => {
    const cancellableFetch = state.fetchAndStoreUserInfo();

    return function cleanup() {
      if (cancellableFetch.isPromised)
        cancellableFetch.cancel();
    }
  }, []);

  return (
      <HeaderUserInfo userInfo={state?.userInfo}/>
  );
}

export default HeaderUserInfoContainer;
