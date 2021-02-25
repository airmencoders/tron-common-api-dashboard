import { accessLogfileState, accessPastLogfileState } from '../../state/logfile/logfile-state';
import UseLoading from '../../hocs/UseLoading/UseLoading';
import { LogfileContents } from './LogfileContents';

const Page = UseLoading(LogfileContents);
const logfileState = accessLogfileState();
const pastLogfileState = accessPastLogfileState();

function LogfilePage() {

  function isLoading(): boolean {
    return logfileState.isLoading && pastLogfileState.isPromised;
  }

  return (
    <Page isLoading={isLoading()} />
  );
}

export default LogfilePage;