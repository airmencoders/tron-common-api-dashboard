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

interface PopupMenuItem {
  title: string;
  icon: React.FC<IconProps>;
  onClick: () => void;
}

function DocumentRowActionCellRenderer(props: {node:{data: any}}) {

  const stubHandleMenuClick = () => {
    console.log(props.node?.data);
  };
  const popupItems = useMemo<Array<PopupMenuItem>>(() => {
    return [
      { title: 'Add to favorites', icon: StarIcon, onClick: stubHandleMenuClick },
      { title: 'Go to file', icon: CircleRightArrowIcon, onClick: stubHandleMenuClick },
      { title: 'Remove', icon: CircleMinusIcon, onClick: stubHandleMenuClick },
      { title: 'Rename', icon: EditIcon, onClick: stubHandleMenuClick },
      { title: 'Upload new version', icon: UploadIcon, onClick: stubHandleMenuClick }
    ]
  }, []);
  return (
      <div className="document-row-action-cell-renderer">
        <Popup
            trigger={
              <div className="document-row-action-cell-renderer__icon">
                <EllipsesIcon size={1} />
              </div>
            }
            on="click"
            offset={[0, -30]}
            position="bottom right"
            popper={{ className: 'document-row-action-cell-renderer__popper'}}
        >
          <Popup.Content>
            {
              popupItems?.length > 0 &&
              popupItems.map(popupItem => (
                  <div className="popper__item" key={popupItem.title} onClick={popupItem.onClick}>
                    <popupItem.icon className="popper__icon" size={1} />
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
