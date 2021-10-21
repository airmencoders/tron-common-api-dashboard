import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

export default function PuzzleIcon(props: IconProps) {
  return (
    <svg
      className={`svg-icon ` +
      `${getSvgIconColorClassname(props.style, props.disabled)} ` +
      `${props.className ?? ''}`
      }
      width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17.7916 10.0833H16.4166V6.41666C16.4166 5.40832 15.5916 4.58332 14.5833 4.58332H10.9166V3.20832C10.9166 1.94332 9.88998 0.916656 8.62498 0.916656C7.35998 0.916656 6.33331 1.94332 6.33331 3.20832V4.58332H2.66665C1.65831 4.58332 0.84248 5.40832 0.84248 6.41666V9.89999H2.20831C3.57415 9.89999 4.68331 11.0092 4.68331 12.375C4.68331 13.7408 3.57415 14.85 2.20831 14.85H0.833313V18.3333C0.833313 19.3417 1.65831 20.1667 2.66665 20.1667H6.14998V18.7917C6.14998 17.4258 7.25915 16.3167 8.62498 16.3167C9.99081 16.3167 11.1 17.4258 11.1 18.7917V20.1667H14.5833C15.5916 20.1667 16.4166 19.3417 16.4166 18.3333V14.6667H17.7916C19.0566 14.6667 20.0833 13.64 20.0833 12.375C20.0833 11.11 19.0566 10.0833 17.7916 10.0833Z'
        fill='white' />
    </svg>
  );
}