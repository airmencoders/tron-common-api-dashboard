import { forwardRef } from 'react';
import './BackdropOverlay.scss';
import { BackdropOverlayProps } from './BackdropOverlayProps';

const BackdropOverlay = forwardRef<HTMLDivElement, BackdropOverlayProps>((props, ref?) => (
  <div ref={ref} className={`backdrop-overlay ${!props.show ? 'backdrop-overlay--hidden' : 'backdrop-overlay--visible'}`} data-testid="backdrop-overlay">

  </div>
));

BackdropOverlay.displayName = 'BackdropOverlay';

export default BackdropOverlay;
