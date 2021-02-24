import { LogfileDto } from "../../api/logfile/logfile-dto";

export interface CurrentLogfileState {
  logs: Array<string>;
  maxLines: number;
  start: number;
  end: number;
  length: number;
  refreshRate: number;
  loading: boolean;
  errors: string | undefined;
}
