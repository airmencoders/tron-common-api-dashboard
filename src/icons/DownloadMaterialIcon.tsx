import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function DownloadMaterialIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 20 24"
      className={`svg-icon download-material-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{ props.iconTitle != null ? props.iconTitle : 'add'}</title>
      <path
        d="M9.87124 16.6855C10.0936 16.6855 10.2937 16.6188 10.516 16.3965L14.2733 12.7615C14.44 12.5947 14.5289 12.4169 14.5289 12.1834C14.5289 11.7277 14.1843 11.4053 13.7175 11.4053C13.5063 11.4053 13.2728 11.4942 13.1172 11.6721L11.4386 13.4618L10.6827 14.251L10.7494 12.5836V0.867068C10.7494 0.400185 10.3492 0 9.87124 0C9.39324 0 8.98194 0.400185 8.98194 0.867068V12.5836L9.05975 14.251L8.30384 13.4618L6.61417 11.6721C6.45855 11.4942 6.2251 11.4053 6.00278 11.4053C5.54701 11.4053 5.20241 11.7277 5.20241 12.1834C5.20241 12.4169 5.30245 12.5947 5.4692 12.7615L9.22649 16.3965C9.44882 16.6188 9.64891 16.6855 9.87124 16.6855ZM3.4905 24H16.2409C18.5641 24 19.7314 22.8439 19.7314 20.554V9.45994C19.7314 7.16999 18.5641 6.0139 16.2409 6.0139H13.1394V7.80361H16.2075C17.308 7.80361 17.9416 8.40389 17.9416 9.55998V20.4539C17.9416 21.61 17.308 22.2103 16.2075 22.2103H3.51274C2.40111 22.2103 1.78972 21.61 1.78972 20.4539V9.55998C1.78972 8.40389 2.40111 7.80361 3.51274 7.80361H6.59194V6.0139H3.4905C1.16721 6.0139 0 7.16999 0 9.45994V20.554C0 22.8439 1.16721 24 3.4905 24Z"
      />
    </svg>
  );
}
