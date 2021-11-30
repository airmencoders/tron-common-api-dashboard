import { useHookstate } from '@hookstate/core';
import { MouseEvent, useEffect } from 'react';
import ChevronRightIcon from '../../icons/ChevronRightIcon';
import FolderIcon from '../../icons/FolderIcon';
import { shortenString } from '../../utils/string-utils';
import DropDown from '../DropDown/DropDown';
import Button from '../Button/Button';
import './BreadCrumbTrail.scss';

export interface BreadCrumbTrailProps {
  path: string;
  onNavigate: (path: string) => void;
  rootName?: string;
}

// maximum path depth before we "collapse" the rest
const MAX_PATH_COMPONENTS = 5;

export default function BreadCrumbTrail(props: BreadCrumbTrailProps) {

  const pathState = useHookstate<string[]>([]);
  const lastElement = useHookstate<string>('');

  useEffect(() => {
    const pathParts = props.path.split('/').filter(item => item.trim() !== '');
    if (pathParts.length === 0) {
      pathState.set(pathParts);
      lastElement.set('');
    }
    else if (pathParts.length === 1) {
      pathState.set([]);
      lastElement.set(pathParts[0]);
    }
    else {
      lastElement.set(pathParts[pathParts.length-1]);
      const subPath = [];
      for (let i=0;i<pathParts.length-1;i++) {
        subPath.push(pathParts[i]);
      }
      pathState.set(subPath);
    }
  }, [props.path]);

  function navToFolderName(event: MouseEvent<HTMLButtonElement>) {
    const pathPieces = event.currentTarget.id.split('_')
    const pathElementNumber = Number(pathPieces[pathPieces.length - 1]);
    const pathAccum = [];
    for (let i=0; i<=pathElementNumber; i++) {
      pathAccum.push(pathState[i].get());
    }
    props.onNavigate('/' + pathAccum.join('/'));
  }

  // build out the path segments (crumbs).. if path depth exceeds the MAX_PATH_COMPONENTS
  //  value then we put the crumbs into a drop down (save for the first and last elements)
  function buildOutPaths() {
    if (pathState.get().length <= MAX_PATH_COMPONENTS) {
      return pathState.get()
        .filter(item => item.trim() !== '')
        .map(item => (
            <div 
              key={item} 
              className='breadcrumb-path-item'
            >
            <ChevronRightIcon />
            <Button
              type='button'
              data-testid={`path_element_${pathElementCount}`}
              id={`path_element_${pathElementCount++}`}
              unstyled onClick={navToFolderName}
            >
              <span className='breadcrumb-bar-link'>{shortenString(item)}</span>
            </Button>
          </div>
        )
      )
    }
    else {
      return <DropDown
        id="collapsed-path-items"
        data-testid="collapsed-path-items"
        anchorContent={
          <span data-testid="collapsed-path-ellipsis" className='breadcrumb-bar-link'>...</span>
        }
        items={pathState.get()
          .filter(item => item.trim() !== '')
          .map(item => { 
            return {
              displayName: shortenString(item),
            action: (event: MouseEvent<HTMLButtonElement>) => { navToFolderName(event) },
              id: `path_element_${pathElementCount++}`
            }
          })
        }
      />
    }
  }
  
  let pathElementCount = 0;
  return (
    <div className='breadcrumb-bar'>
      <div className='breadcrumb-root-item'>
        <FolderIcon />
        {pathState.value.length > 0 || lastElement.value ?
          <Button type='button'
            id='path_element_root'
            data-testid='path_element_root'
            unstyled
            onClick={() => props.onNavigate('')}
          >
            <span className='breadcrumb-bar-link'>{props.rootName ?? 'My Folders'}</span>
          </Button> :
          <span data-testid='path_element_root' className='breadcrumb-bar--root-only'>{props.rootName ?? 'My Folders'}</span>
        }
      </div>
      { buildOutPaths() }
      {
        lastElement.get() !== '' ?
        <div 
          className='breadcrumb-last-item'
          data-testid='breadcrumb-last-item'
        >
          <ChevronRightIcon />
          <span className='breadcrumb-last-item'>{shortenString(lastElement.get())}</span>
        </div>
        :
        null
      }
    </div>
  )
}