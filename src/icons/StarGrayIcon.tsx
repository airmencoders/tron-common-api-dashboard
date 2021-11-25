import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function StarGrayIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 18 16"
      width={`${props.size}em`}
      height={`${props.size}em`}
      style={{ fontSize: `${props.size}em` }}
      className={
        `svg-icon ` +
        `${props.className ?? ''}`
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle != null ? props.iconTitle : 'starGray'}</title>
      <path d="M3.06984 15.8251C3.36523 16.0557 3.73987 15.9764 4.18655 15.6522L7.99778 12.8496L11.8162 15.6522C12.2629 15.9764 12.6303 16.0557 12.9329 15.8251C13.2283 15.6018 13.2931 15.2344 13.113 14.7084L11.6073 10.2272L15.4545 7.46061C15.9012 7.14361 16.0813 6.81219 15.966 6.45197C15.8508 6.10615 15.5122 5.93324 14.9574 5.94044L10.2384 5.96926L8.80469 1.4664C8.63178 0.933257 8.37242 0.666687 7.99778 0.666687C7.63034 0.666687 7.37098 0.933257 7.19807 1.4664L5.76436 5.96926L1.04536 5.94044C0.490604 5.93324 0.151989 6.10615 0.0367154 6.45197C-0.0857625 6.81219 0.101557 7.14361 0.548241 7.46061L4.39549 10.2272L2.88973 14.7084C2.70961 15.2344 2.77446 15.6018 3.06984 15.8251Z" fill="#C2C4CB"/>    </svg>
  );
}
