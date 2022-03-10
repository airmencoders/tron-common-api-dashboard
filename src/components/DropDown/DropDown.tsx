import React, { ReactNode } from 'react';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'; //For semantic-ui
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
  function buildItems(): ReactNode[] {
    const items: ReactNode[] = [];
    for (let i = 0; i < props.items.length; i++) {
      items.push(
        <Dropdown.Item
          key={`${props.id}_dropdown_item__${i}`}
          id={props.items[i].id ?? ''}
          data-testid={props.items[i].id ?? ''}
          onClick={(event: any) => props.items[i].action(event)}
          text={props.items[i].displayName}
        />
      );
    }
    return items;
  }

  return (
    <Dropdown
      icon={null}
      trigger={
        <Button icon type="button" unstyled={props.anchorUnstyled}>
          {props.anchorContent}
        </Button>
      }
    >
      <Dropdown.Menu>{buildItems()}</Dropdown.Menu>
    </Dropdown>
  );
}
