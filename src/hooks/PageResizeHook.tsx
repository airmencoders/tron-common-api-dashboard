import {useEffect, useRef, useState} from 'react';
import {isMobile} from 'react-device-detect';

export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export enum DeviceSize {
  UNKNOWN = 0,
  MOBILE = 576,
  TABLET = 768,
  DESKTOP = 992
}

export interface DeviceInfo {
  deviceBySize: DeviceSize,
  isMobile: boolean,
  windowSize: WindowSize
}

export function useDeviceInfo(debounceTime = 100) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceBySize: DeviceSize.UNKNOWN,
    isMobile: isMobile,
    windowSize: {
      width: undefined,
      height: undefined,
    }
  });

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    let timeoutId: number | undefined = undefined;

    // Handler to call on window resize
    function handleResize() {
      if (debounceTime === 0) {
        setState();
        return;
      }

      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }

      // Set window width/height to state
      timeoutId = window.setTimeout(() => setState(), debounceTime);
    }

    function setState() {
      if (!mountedRef.current) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width == null) {
        setDeviceInfo({
          deviceBySize: DeviceSize.UNKNOWN,
          isMobile: false,
          windowSize: {
            width,
            height
          }
        });
        return;
      }
  
      if (width > DeviceSize.TABLET && deviceInfo.deviceBySize !== DeviceSize.DESKTOP) {
        setDeviceInfo({
          deviceBySize: DeviceSize.DESKTOP,
          isMobile: isMobile,
          windowSize: {
            width,
            height
          }
        });
      } else if (width > DeviceSize.MOBILE && deviceInfo.deviceBySize !== DeviceSize.TABLET) {
        setDeviceInfo({
          deviceBySize: DeviceSize.TABLET,
          isMobile: isMobile,
          windowSize: {
            width,
            height
          }
        });
      } else {
        if (deviceInfo.deviceBySize !== DeviceSize.MOBILE) {
          setDeviceInfo({
            deviceBySize: DeviceSize.MOBILE,
            isMobile: isMobile,
          windowSize: {
            width,
            height
          }
          });
        }
      }
    }

    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => {
      mountedRef.current = false;

      window.removeEventListener('resize', handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount

  return deviceInfo;
}
