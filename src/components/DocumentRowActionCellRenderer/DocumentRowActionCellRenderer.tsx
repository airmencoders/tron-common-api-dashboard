import React, {ReactElement, ReactNode, useMemo} from 'react';
import {Card, Image, Popup, Rating} from 'semantic-ui-react';
import EllipsesIcon from '../../icons/EllipsesIcon';
import Button from '../Button/Button';
import './DocumentRowActionCellRenderer.scss';
import StarIcon from '../../icons/StarIcon';
import {IconProps} from '../../icons/IconProps';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import EditIcon from '../../icons/EditIcon';
import UploadIcon from '../../icons/UploadIcon';
import {DocumentDto} from '../../openapi';

interface PopupMenuItem {
  title: string;
  icon: React.FC<IconProps>;
  onClick: () => void;
}

interface DocumentRowActionCellRendererProps {
  node: { data: any; };
  actions: {
    delete: (doc: DocumentDto) => void;
  }
}

function DocumentRowActionCellRenderer(props: DocumentRowActionCellRendererProps) {

  const stubHandleMenuClick = () => {
    console.log(props.node?.data);
  };
  const popupItems = useMemo<Array<PopupMenuItem>>(() => {
    return [
      { title: 'Add to favorites', icon: StarIcon, onClick: stubHandleMenuClick },
      { title: 'Go to file', icon: CircleRightArrowIcon, onClick: stubHandleMenuClick },
      { title: 'Remove', icon: CircleMinusIcon, onClick: () => props.actions.delete(props.node.data) },
      { title: 'Rename', icon: EditIcon, onClick: stubHandleMenuClick },
      { title: 'Upload new version', icon: UploadIcon, onClick: stubHandleMenuClick }
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
        >
          <Popup.Content className={'document-row-action-cell-renderer__popper'}>
            {
              popupItems?.length > 0 &&
              popupItems.map(popupItem => (
                  <div className="popper__item" key={popupItem.title} onClick={popupItem.onClick}>
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
