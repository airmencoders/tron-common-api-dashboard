import { Spinner } from 'react-bootstrap';
import './UseLoading.scss';

function UseLoading(Component: React.ComponentType<any>) {
  return function UseLoadingWrapper({ isLoading, fixed, ...props }: { isLoading: boolean, fixed?: boolean }) {
    return (
      <>
        {isLoading ?
          <div className={fixed ? "loading-page-container loading-page-container--fixed" : "loading-page-container"}>
            <div className="loading-page-container__spinner-wrapper">
              <Spinner className="spinner-wrapper__spinner" animation="border" role="status" variant="info">
                <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
          </div>
          :
          <Component {...props} />
        }
      </>
    );
  }
}

export default UseLoading;