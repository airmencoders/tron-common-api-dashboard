import { WithLoadingProps } from './WithLoadingProps';
import Spinner from '../../components/Spinner/Spinner';


function withLoading<P>(Component: React.ComponentType<P>) {
  return function withLoadingWrapper(props: WithLoadingProps & P) {
    const { isLoading, fixed } = props;
    return (
      <>
        {isLoading ?
          <Spinner fixed={fixed} centered />
          :
          <Component {...props as P} />
        }
      </>
    );
  }
}

export default withLoading;