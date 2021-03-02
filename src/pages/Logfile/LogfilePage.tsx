import { useLogfileState, usePastLogfileState } from '../../state/logfile/logfile-state';
import UseLoading from '../../hocs/UseLoading/UseLoading';
import { LogfileContents } from './LogfileContents';

const Page = UseLoading(LogfileContents);

function LogfilePage() {
  const logfileState = useLogfileState();
  const pastLogfileState = usePastLogfileState();

  function isLoading(): boolean {
    return logfileState.isLoading && pastLogfileState.isPromised;
  }

  return (
    <Page isLoading={isLoading()} />
  );
}

export default LogfilePage;