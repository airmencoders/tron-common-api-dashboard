import React, {useMemo} from 'react';
import {Popup} from 'semantic-ui-react';
import EllipsesIcon from '../../icons/EllipsesIcon';
import './DocumentRowActionCellRenderer.scss';
import StarIcon from '../../icons/StarIcon';
import {IconProps} from '../../icons/IconProps';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import EditIcon from '../../icons/EditIcon';
import UploadIcon from '../../icons/UploadIcon';

interface PopupMenuItem {
  title: string;
  icon: React.FC<IconProps>;
  onClick: () => void;
  authorized: boolean;
}

interface DocumentRowActionCellRendererProps {
  node: { data: any; };
  actions: {
    delete: {
      isAuthorized: (data: any) => boolean,
      action: (doc: any) => void;
    }
  }
}

function DocumentRowActionCellRenderer(props: DocumentRowActionCellRendererProps) {
  const stubHandleMenuClick = () => {
    console.log(props.node?.data);
  };
  const popupItems = useMemo<Array<PopupMenuItem>>(() => {
    return [
      { title: 'Add to favorites', icon: StarIcon, onClick: stubHandleMenuClick, authorized: true },
      { title: 'Go to file', icon: CircleRightArrowIcon, onClick: stubHandleMenuClick, authorized: true },
      { title: 'Remove', icon: CircleMinusIcon, onClick: () => props.actions.delete.action(props.node.data), authorized: props.actions.delete.isAuthorized(props.node?.data) },
      { title: 'Rename', icon: EditIcon, onClick: stubHandleMenuClick, authorized: true },
      { title: 'Upload new version', icon: UploadIcon, onClick: stubHandleMenuClick, authorized: true }
    ]
  }, []);

  return (
      <div className="document-row-action-cell-renderer" data-testid="document-row-action-cell-renderer">
        <Popup
            trigger={
              <div className="document-row-action-cell-renderer__icon">
                <EllipsesIcon size={1} iconTitle="more" />
              </div>
            }
            on="click"
            offset={[0, -30]}
            position="bottom right"
            className={'document-row-action-cell-renderer__popper'}
        >
          <Popup.Content>
            {
              popupItems?.length > 0 &&
              popupItems.map(popupItem => {
                if (popupItem.authorized) {
                  return (
                    <div className="popper__item" key={popupItem.title} onClick={popupItem.onClick}>
                      <popupItem.icon className="popper__icon" size={1} iconTitle={popupItem.title} />
                      <span className="popper__title">{popupItem.title}</span>
                    </div>
                  );
                }
              })
            }

          </Popup.Content>
        </Popup>
      </div>
  );
}

export default DocumentRowActionCellRenderer;
