import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function AddMaterialIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={`svg-icon ellipses-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{ props.iconTitle != null ? props.iconTitle : 'add'}</title>
      <path
        d="M0.970909 9.97091H8.02909V17.0291C8.02909 17.5527 8.46546 18 9 18C9.53455 18 9.98182 17.5527 9.98182 17.0291V9.97091H17.0291C17.5527 9.97091 18 9.53455 18 9C18 8.46546 17.5527 8.01818 17.0291 8.01818H9.98182V0.970909C9.98182 0.447273 9.53455 0 9 0C8.46546 0 8.02909 0.447273 8.02909 0.970909V8.01818H0.970909C0.447273 8.01818 0 8.46546 0 9C0 9.53455 0.447273 9.97091 0.970909 9.97091Z"
      />
    </svg>
  );
}
