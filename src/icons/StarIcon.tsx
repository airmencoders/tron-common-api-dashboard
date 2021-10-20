import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function StarIcon(props: IconProps) {
  return (
      <svg
          className={`svg-icon ellipses-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'star'}</title>
        <path d="M4.60477 22.7377C5.04785 23.0835 5.6098 22.9646 6.27983 22.4783L11.9967 18.2744L17.7243 22.4783C18.3943 22.9646 18.9455 23.0835 19.3994 22.7377C19.8425 22.4026 19.9397 21.8515 19.6695 21.0626L17.4109 14.3407L23.1818 10.1909C23.8518 9.71538 24.122 9.21826 23.9491 8.67792C23.7762 8.15919 23.2682 7.89982 22.4361 7.91063L15.3576 7.95386L13.207 1.19956C12.9477 0.399854 12.5586 0 11.9967 0C11.4455 0 11.0565 0.399854 10.7971 1.19956L8.64654 7.95386L1.56804 7.91063C0.735906 7.89982 0.227983 8.15919 0.0550731 8.67792C-0.128644 9.21826 0.152335 9.71538 0.822361 10.1909L6.59323 14.3407L4.33459 21.0626C4.06442 21.8515 4.16168 22.4026 4.60477 22.7377Z" fill="#5F96EA"/>
      </svg>

);
}

export default StarIcon;
