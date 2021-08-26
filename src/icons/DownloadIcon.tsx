import { getIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function DownloadIcon(props: IconProps) {
  return (
      <i 
        className={
          `download-icon bi bi-download ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'download'}
      ></i>
  );
}

export default DownloadIcon;
