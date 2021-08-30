import { getIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function MetricIcon(props: IconProps) {
  return (
      <i 
        className={
          `metric-icon bi bi-bar-chart-line ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`}
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'metric'}
      ></i>
  );
}

export default MetricIcon;
