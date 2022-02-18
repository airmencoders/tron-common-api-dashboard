import { getSvgIconColorClassname } from "./icon-util";
import { IconProps } from "./IconProps";
import { SvgIconProps } from "./SvgIconProps";

export default function FileIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      className={
        `svg-icon close-nav-icon` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      width={props.size * 19}
      height={props.size * 24}
      viewBox="0 0 19 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.47015 24H15.3582C17.6754 24 18.8284 22.8246 18.8284 20.4963V10.3321C18.8284 8.88806 18.6604 8.26119 17.7649 7.34328L11.597 1.06343C10.7463 0.190298 10.041 0 8.78731 0H3.47015C1.16418 0 0 1.18657 0 3.51493V20.4963C0 22.8358 1.15298 24 3.47015 24ZM3.54851 22.1978C2.39552 22.1978 1.80224 21.5821 1.80224 20.4627V3.54851C1.80224 2.4403 2.39552 1.80224 3.5597 1.80224H8.54104V8.30597C8.54104 9.71642 9.24627 10.4104 10.6455 10.4104H17.0261V20.4627C17.0261 21.5821 16.4328 22.1978 15.2687 22.1978H3.54851ZM10.847 8.72015C10.3993 8.72015 10.2313 8.54104 10.2313 8.09328V2.14925L16.6791 8.72015H10.847Z"
        fill="#1B1C22"
      />
    </svg>
  );
}
