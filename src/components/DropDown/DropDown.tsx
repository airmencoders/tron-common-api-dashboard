import { useHookstate } from '@hookstate/core';
import { Button } from '@trussworks/react-uswds';
import React, { ReactChild, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';

export interface DropDownProps {
  anchorContent: string | ReactNode;
  children: ReactChild | ReactChild[];
}

export default function DropDown(props: DropDownProps) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="none" bsPrefix="p-0">
        <Button icon type="button">
          {props.anchorContent}
        </Button>
      </Dropdown.Toggle>
      <Dropdown.Menu>{props.children}</Dropdown.Menu>
    </Dropdown>
  );
}
