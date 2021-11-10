import React, { useMemo } from 'react';
import { Popup } from 'semantic-ui-react';
import EllipsesIcon from '../../icons/EllipsesIcon';
import { IconProps } from '../../icons/IconProps';
import './DocumentRowActionCellRenderer.scss';

export interface PopupMenuItem<T> {
  title: string;
  icon: React.FC<IconProps>;
  shouldShow?: (data: T) => boolean;
  isAuthorized: (data: T) => boolean;
  onClick: (doc: T) => void;
}

interface DocumentRowActionCellRendererProps<T> {
  node: { data: T; };
  menuItems: PopupMenuItem<T>[];
}

function DocumentRowActionCellRenderer<T>(props: DocumentRowActionCellRendererProps<T>) {

  const [open, setOpen] = React.useState(false);
  const popupItems = useMemo<Array<PopupMenuItem<T>>>(() => {
    return props.menuItems
  }, []);

  return (
      <div className="document-row-action-cell-renderer" data-testid="document-row-action-cell-renderer">
        <Popup
            trigger={
              <div className="document-row-action-cell-renderer__icon" data-testid="more_action">
                <EllipsesIcon style="primary" fill size={1} iconTitle="more" />
              </div>
            }
            on="click"
            offset={[0, -30]}
            position="bottom right"
            className={'document-row-action-cell-renderer__popper document-space-popup-actions'}
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
                  return popupItem.shouldShow == undefined 
                    || popupItem.shouldShow(props.node.data)
                })
                .filter(popupItem => popupItem.isAuthorized(props.node.data))
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
