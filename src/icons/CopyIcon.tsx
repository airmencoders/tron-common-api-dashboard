import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function CopyIcon(props: IconProps) {
  return (
    <i 
      className={
        `clipboard-icon bi bi-clipboard ` +
        `${getIconColorClassname(props.style, props.disabled)} ` +
        `${props.className}`
      }
      style={{fontSize: `${props.size}rem`}}
      title={ props.iconTitle != null ? props.iconTitle : 'copy'}
    ></i>
  );
}

export default CopyIcon;
