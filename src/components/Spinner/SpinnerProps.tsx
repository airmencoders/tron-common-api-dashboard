export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Flag to set position: fix
   */
  fixed?: boolean;

  /**
   * Flag that centers the spinner
   */
  centered?: boolean;

  small?: boolean;
}