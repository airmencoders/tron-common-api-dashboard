import React from 'react';
import {ButtonProps} from './ButtonProps';
import { Button as UswdsButton } from '@trussworks/react-uswds/lib/index'

import './Button.scss';

function Button(props: ButtonProps) {
  const { disableMobileFullWidth } = props;
  return (
    <UswdsButton {...props} className={`${props.className ?? ''}${disableMobileFullWidth ? ' usa-button--disable-mobile-full-width' : ''}`} />
  );
}

export default Button;
