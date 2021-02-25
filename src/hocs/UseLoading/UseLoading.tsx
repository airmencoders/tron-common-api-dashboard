import { Spinner } from "react-bootstrap";
import './UseLoading.scss';

function UseLoading(Component: React.ComponentType<any>) {
  return function UseLoadingWrapper({ props, isLoading }: { props?: any, isLoading: boolean }) {
    return (
      <>
        {isLoading &&
          <div className='loading-page-container'>
            <Spinner className='loading-page-container__spinner' animation='border' role='status' variant='info'>
              <span className='sr-only'>Loading...</span>
            </Spinner>
          </div>
        }
        <Component {...props} />
      </>
    );
  }
}

export default UseLoading;