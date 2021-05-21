import { Spinner as BootStrapSpinner, } from 'react-bootstrap';
import { SpinnerProps } from './SpinnerProps';
import './Spinner.scss';

function Spinner({ fixed, centered, small, ...props }: SpinnerProps) {
  return (
    <div className={`spinner-container ${fixed ? "spinner-container--fixed" : ""} ${centered ? "spinner-container--centered" : ""}`} data-testid="spinner" {...props}>
      <div className="spinner-container__spinner-wrapper">
        <BootStrapSpinner size={small ? 'sm' : undefined} className="spinner-wrapper__spinner" animation="border" role="status" variant="info">
          <span className="sr-only">Loading...</span>
        </BootStrapSpinner>
      </div>
    </div>
  );
}

export default Spinner;