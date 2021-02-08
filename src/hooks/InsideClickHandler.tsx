import { useEffect } from "react";

/**
 * Hook that alerts when clicked inside ref
 */
export function useInsideClickHandler(ref: any, clickHandler: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked inside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && ref.current.contains(event.target)) {
        clickHandler();
      }
    }

    // Bind the event listener
    document.addEventListener("click", handleClickOutside);
    return () => {
      // Unbind the event listener
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref]);
}
