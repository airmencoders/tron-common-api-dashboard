import { Spinner } from 'react-bootstrap';
import './WithLoading.scss';
import { UseLoadingProps } from './WithLoadingProps';

function withLoading<P>(Component: React.ComponentType<P>) {
  return function withLoadingWrapper(props: UseLoadingProps & P) {
    const { isLoading, fixed } = props;
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
          <Component {...props as P} />
        }
      </>
    );
  }
}

export default withLoading;