export function performActionWhenMounted<T>(isMounted: boolean, action: () => T): (T | undefined) {
  if (isMounted) {
    return action();
  } else {
    return;
  }
}