import { Spinner } from "react-bootstrap";
import './UseLoading.scss';

function UseLoading(Component: React.ComponentType<any>) {
  return function UseLoadingWrapper({ isLoading, ...props }: { isLoading: boolean }) {
    return (
      <>
        <Component {...props} />
        {isLoading &&
          <div className='loading-page-container'>
            <Spinner className='loading-page-container__spinner' animation='border' role='status' variant='info'>
              <span className='sr-only'>Loading...</span>
            </Spinner>
          </div>
        }
      </>
    );
  }
}

export default UseLoading;