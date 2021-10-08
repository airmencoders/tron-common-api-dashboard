import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function ChartIcon(props: IconProps) {
  return (
      <svg
          className={`svg-icon ` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'chart'}</title>
        <path d="M9.55556 1.33337L5.86111 5.02782L3.91667 3.08337L1 6.00004" stroke="#515B68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

  );
}

export default ChartIcon;
