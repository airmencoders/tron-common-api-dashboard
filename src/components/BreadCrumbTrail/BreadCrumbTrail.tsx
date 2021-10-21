import { useHookstate } from '@hookstate/core';
import { MouseEvent, useEffect } from 'react';
import ChevronRightIcon from '../../icons/ChevronRightIcon';
import FolderIcon from '../../icons/FolderIcon';
import Button from '../Button/Button';
import './BreadCrumbTrail.scss';

export interface BreadCrumbTrailProps {
  path: string;
  onNavigate: (path: string) => void;
}

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
  
  let pathElementCount = 0;
  return (
    <div className='breadcrumb-bar'>
      <div className='breadcrumb-root-item'>
        <FolderIcon />
        <Button type='button'
          id='path_element_root'
          data-testid='path_element_root'
          unstyled
          onClick={() => props.onNavigate('')}
        >
          <span className='breadcrumb-bar-link'>My Folders</span>
        </Button>
      </div>
      {
        pathState.get()
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
                 <span className='breadcrumb-bar-link'>{item}</span>
               </Button>
            </div>
          )
        )
      }
      {
        lastElement.get() !== '' ?
        <div 
          className='breadcrumb-last-item'
          data-testid='breadcrumb-last-item'
        >
          <ChevronRightIcon />
          <span className='breadcrumb-last-item'>{lastElement.get()}</span>
        </div>
        :
        null
      }
    </div>
  )
}