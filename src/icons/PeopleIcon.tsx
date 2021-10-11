import { getIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function PeopleIcon(props: IconProps) {
  return (
    <i
      className={
        `people-icon bi bi-people ` +
        `${getIconColorClassname(props.style, props.disabled)} ` +
        `${props.className || ''}`
      }
      style={{ fontSize: `${props.size}rem` }}
      title={props.iconTitle != null ? props.iconTitle : 'People'}
    ></i>
  );
}

export default PeopleIcon;
