import {IconProps} from './IconProps';
import React from 'react';
import { getIconColorClassname } from './icon-util';

function QuestionIcon(props: IconProps) {
  return (
      <i 
        className={
          `question-icon bi bi-question-circle ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'question'}
      ></i>
  );
}

export default QuestionIcon;
