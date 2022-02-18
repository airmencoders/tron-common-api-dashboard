import { ReactNode } from 'react';
import { formatDocumentSpaceDate } from '../../utils/date-utils';
import './recent-document-tile.scss';

const headerHeight = 100;

export interface RecentDocumentTileProps {
  icon: ReactNode;
  fileName: string;
  parentFolderId: string;
  uploadedBy: string;
  timestamp: string;
  width: number;
  height: number;
}

export default function RecentDocumentTile(props: RecentDocumentTileProps) {
 
  return (
    <div
      className={`recent-doc-tile`}
      style={{ height: props.height, width: props.width }}
    >
      <div className="recent-doc-tile__header" style={{ height: `${headerHeight}px`, width: `${props.width}px` }}>
        <div className="header__top">
          <span className="header__icon">
            {props.icon}
          </span>
          <span className="header__title">
            {props.fileName}
          </span>
        </div>
        <div className="header__value">
          {`Uploaded by ${props.uploadedBy} on ${formatDocumentSpaceDate(props.timestamp)}`}
        </div>
      </div>
    </div>
  );
}
