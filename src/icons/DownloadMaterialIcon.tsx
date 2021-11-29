import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function DownloadMaterialIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`svg-icon download-material-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{ props.iconTitle != null ? props.iconTitle : 'add'}</title>
        <path d="M11.8712 16.6855C12.0936 16.6855 12.2937 16.6188 12.516 16.3965L16.2733 12.7615C16.44 12.5947 16.5289 12.4169 16.5289 12.1834C16.5289 11.7277 16.1843 11.4053 15.7175 11.4053C15.5063 11.4053 15.2728 11.4942 15.1172 11.6721L13.4386 13.4618L12.6827 14.251L12.7494 12.5836V0.867068C12.7494 0.400185 12.3492 0 11.8712 0C11.3932 0 10.9819 0.400185 10.9819 0.867068V12.5836L11.0597 14.251L10.3038 13.4618L8.61417 11.6721C8.45855 11.4942 8.2251 11.4053 8.00278 11.4053C7.54701 11.4053 7.20241 11.7277 7.20241 12.1834C7.20241 12.4169 7.30245 12.5947 7.4692 12.7615L11.2265 16.3965C11.4488 16.6188 11.6489 16.6855 11.8712 16.6855ZM5.4905 24H18.2409C20.5641 24 21.7314 22.8439 21.7314 20.554V9.45994C21.7314 7.16999 20.5641 6.0139 18.2409 6.0139H15.1394V7.80361H18.2075C19.308 7.80361 19.9416 8.40389 19.9416 9.55998V20.4539C19.9416 21.61 19.308 22.2103 18.2075 22.2103H5.51274C4.40111 22.2103 3.78972 21.61 3.78972 20.4539V9.55998C3.78972 8.40389 4.40111 7.80361 5.51274 7.80361H8.59194V6.0139H5.4905C3.16721 6.0139 2 7.16999 2 9.45994V20.554C2 22.8439 3.16721 24 5.4905 24Z" />
    </svg>
);
}
