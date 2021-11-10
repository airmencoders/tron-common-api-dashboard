import {useLocalStorage} from '@rehooks/local-storage';


export function useNavCollapsed() {
  return useLocalStorage<boolean>('isNavCollapsed', false);
}
