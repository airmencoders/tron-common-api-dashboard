import { IconProps } from './IconProps';

function DownloadIcon(props: IconProps) {
  return (
      <i className={`download-icon bi bi-download ${props.className}`}
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'download'}
      ></i>
  );
}

export default DownloadIcon;
