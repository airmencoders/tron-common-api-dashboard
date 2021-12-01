import React, { ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import Button from '../../components/Button/Button';


export interface Item {
  id?: string;
  displayName: string;
  action: ((event: React.MouseEvent<HTMLButtonElement>) => void) | (() => void);  
}

export interface DropDownProps {
  id: string;
  anchorUnstyled?: boolean;
  anchorContent: string | ReactNode;
  items: Item[];
}

export default function DropDown(props: DropDownProps) {  

  function buildItems() : ReactNode[] {
    const items : ReactNode[] = [];
    for (let i=0;i<props.items.length;i++) {
      items.push(
        <>
        <Dropdown.Item key={`${props.id}_dropdown_item__${i}`}>
          <Button
            id={props.items[i].id ?? ''}
            data-testid={props.items[i].id ?? ''}
            type="button"
            unstyled
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => props.items[i].action(event)}
          >
            {props.items[i].displayName}
          </Button>
        </Dropdown.Item>
        { (i+1) >= props.items.length ? null : <Dropdown.Divider />}
        </>
      )
    }
    return items;
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="none" bsPrefix="p-0">
        <Button icon type="button" unstyled={props.anchorUnstyled}>
          {props.anchorContent}
        </Button>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {buildItems()}
      </Dropdown.Menu>
    </Dropdown>
  );
}
