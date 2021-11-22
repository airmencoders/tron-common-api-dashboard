import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useWindowSize, WindowSize } from './PageResizeHook';

export enum DeviceSize {
  UNKNOWN = 0,
  MOBILE = 576,
  TABLET = 768,
  DESKTOP = 992
}

export interface DeviceInfo {
  deviceBySize: DeviceSize,
  isMobile: boolean,
  window: WindowSize
}

export function useDeviceDetect() {
  const windowSize = useWindowSize();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceBySize: DeviceSize.UNKNOWN,
    isMobile: false,
    window: {
      width: undefined,
      height: undefined
    }
  });

  useEffect(() => {
    const { width } = windowSize;

    if (width == null) {
      setDeviceInfo({
        deviceBySize: DeviceSize.UNKNOWN,
        isMobile: false,
        window: windowSize
      });

      return;
    }

    if (width > DeviceSize.TABLET) {
      setDeviceInfo({
        deviceBySize: DeviceSize.DESKTOP,
        isMobile: isMobile,
        window: windowSize
      });
    } else if (width > DeviceSize.MOBILE) {
      setDeviceInfo({
        deviceBySize: DeviceSize.TABLET,
        isMobile: isMobile,
        window: windowSize
      });
    } else {
      setDeviceInfo({
        deviceBySize: DeviceSize.MOBILE,
        isMobile: isMobile,
        window: windowSize
      });
    }
  }, [windowSize]);

  return deviceInfo;
}
