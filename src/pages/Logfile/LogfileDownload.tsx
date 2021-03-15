import { LogfileDownloadProps } from "./LogfileDownloadProps";

function LogfileDownload(props: LogfileDownloadProps) {
  return (
    <ul>
      {props.logfileDtos?.map((item) => {
        return (
          <li key={item.name}>
            <a href={item.downloadUri}>{item.name}</a>
          </li>
        );
      })}
    </ul>
  );
}

export default LogfileDownload;