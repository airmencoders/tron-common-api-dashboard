import { forwardRef } from 'react';
import './BackdropOverlay.scss';

const BackdropOverlay = forwardRef<HTMLDivElement, {}>((props, ref?) => (
  <div ref={ref} className="backdrop-overlay" data-testid="backdrop-overlay">

  </div>
));

export default BackdropOverlay;
