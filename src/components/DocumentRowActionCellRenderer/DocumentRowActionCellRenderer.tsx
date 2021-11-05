import React, { useMemo, useState } from 'react';
import { Popup } from 'semantic-ui-react';
import EllipsesIcon from '../../icons/EllipsesIcon';
import { IconProps } from '../../icons/IconProps';
import { DocumentDto } from '../../openapi';
import './DocumentRowActionCellRenderer.scss';

export interface PopupMenuItem {
  title: string;
  icon: React.FC<IconProps>;
  shouldShowFor?: ItemType;
  onClick: (doc: DocumentDto) => void;
}

export enum ItemType {
  FILE,
  FOLDER,
  BOTH
}

interface DocumentRowActionCellRendererProps {
  node: { data: any; };
  menuItems: PopupMenuItem[];
}

function DocumentRowActionCellRenderer(props: DocumentRowActionCellRendererProps) {

  const [open, setOpen] = useState(false);

  const popupItems = useMemo<Array<PopupMenuItem>>(() => {
    return props.menuItems
  }, []);

  return (
      <div className="document-row-action-cell-renderer" data-testid="document-row-action-cell-renderer">
        <Popup
            trigger={
              <div className="document-row-action-cell-renderer__icon" data-testid="more_action">
                <EllipsesIcon size={1} iconTitle="more" />
              </div>
            }
            on="click"
            offset={[0, -30]}
            position="bottom right"
            className={'document-row-action-cell-renderer__popper'}
            closeOnDocumentClick
            onClose={() => setOpen(false)}
            open={open}
            onOpen={() => setOpen(true)}
        >
          <Popup.Content>
            {
              popupItems?.length > 0 &&
              popupItems
                .filter(popupItem => {
                  return popupItem.shouldShowFor == undefined 
                    || popupItem.shouldShowFor === ItemType.BOTH
                    || (popupItem.shouldShowFor === ItemType.FILE && !props.node.data?.folder)
                    || (popupItem.shouldShowFor === ItemType.FOLDER && props.node.data?.folder)
                })
                .map(popupItem => (
                  <div className="popper__item" key={popupItem.title} onClick={() => {
                      setOpen(false);
                      popupItem.onClick(props.node.data);
                  }}>
                    <popupItem.icon className="popper__icon" size={1} iconTitle={popupItem.title} />
                    <span className="popper__title">{popupItem.title}</span>
                  </div>
              ))
            }
          </Popup.Content>
        </Popup>
      </div>
  );
}

export default DocumentRowActionCellRenderer;
