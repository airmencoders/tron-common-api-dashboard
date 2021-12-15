import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function UploadMaterialIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`svg-icon upload-material-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
    >
      <title>{ props.iconTitle != null ? props.iconTitle : 'add'}</title>
        <path d="M12.4426 15.6739C12.8999 15.6739 13.2827 15.2911 13.2827 14.8445V3.92379L13.2189 2.32875L13.942 3.08374L15.5476 4.80638C15.6965 4.97652 15.9198 5.06159 16.1218 5.06159C16.5685 5.06159 16.8981 4.74258 16.8981 4.3066C16.8981 4.0833 16.813 3.91316 16.6535 3.75366L13.0594 0.287107C12.8467 0.0744351 12.6553 0 12.4426 0C12.23 0 12.0385 0.0744351 11.8259 0.287107L8.23172 3.75366C8.07222 3.91316 7.97652 4.0833 7.97652 4.3066C7.97652 4.74258 8.30616 5.06159 8.74214 5.06159C8.95481 5.06159 9.17811 4.97652 9.32698 4.80638L10.9433 3.08374L11.6664 2.32875L11.5919 3.92379V14.8445C11.5919 15.2911 11.9854 15.6739 12.4426 15.6739ZM6.33895 24H18.5357C20.7581 24 21.8746 22.8941 21.8746 20.7036V10.0913C21.8746 7.90075 20.7581 6.79486 18.5357 6.79486H15.5689V8.50687H18.5038C19.5565 8.50687 20.1626 9.08108 20.1626 10.187V20.6079C20.1626 21.7138 19.5565 22.288 18.5038 22.288H6.36021C5.29685 22.288 4.71201 21.7138 4.71201 20.6079V10.187C4.71201 9.08108 5.29685 8.50687 6.36021 8.50687H9.30572V6.79486H6.33895C4.11653 6.79486 3 7.90075 3 10.0913V20.7036C3 22.8941 4.11653 24 6.33895 24Z" />
    </svg>
  );
}
