import {useEffect, useState} from 'react';

export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
