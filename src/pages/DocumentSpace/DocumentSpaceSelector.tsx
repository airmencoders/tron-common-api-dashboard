import React, { useEffect } from 'react';
import {useHistory} from 'react-router';
import {useLocation} from 'react-router-dom';
import './DocumentSpacePage.scss';
import DocumentSpaceService from "../../state/document-space/document-space-service";
import {DocumentSpaceSelectorProps} from "./DocumentSpaceSelectorProps";
import {useDocumentSpaceGlobalState} from '../../state/document-space/document-space-state';
import { Dropdown, DropdownItemProps, Item, ItemMeta } from 'semantic-ui-react';


export const spaceIdQueryKey = 'spaceId';
export const pathQueryKey = 'path';

function DocumentSpaceSelector(props: DocumentSpaceSelectorProps) {
  const location = useLocation();
  const history = useHistory();
  const globalDocumentSpaceService = useDocumentSpaceGlobalState();

  useEffect(() => {
    if (props.selectedSpace) {
      globalDocumentSpaceService.setCurrentDocumentSpace(props.selectedSpace);
    }
  }, [props.selectedSpace]);

  function getSpaceOptions(isDocumentSpacesLoading: boolean, isDocumentSpacesErrored: boolean, documentSpaceService: DocumentSpaceService): DropdownItemProps[] {
    if (isDocumentSpacesLoading) {
      return (
        [{text: 'Loading...', value: 'Loading...'}]
      )
    }

    if (isDocumentSpacesErrored) {
      return (
        [{text: 'Could not load spaces', value: 'error'}]
      )
    }
    
    if (props.onUnreachableSpace) {
      return [ { id: 'none', name: ' ' }, ...documentSpaceService.documentSpaces].map((item) =>
        ({value: item.id, text: item.name})
    );
    }
    
    return documentSpaceService.documentSpaces.map((item) =>
      ({value: item.id, text: item.name, 'data-testid': item.name})
    );
  }

   
  return (
    <Dropdown
      id="document-space"
      name="document-space"
      data-testid="document-space-selector"
      value={props.onUnreachableSpace ? 'none' : props.selectedSpace?.id}
      disabled={props.isDocumentSpacesLoading || props.isDocumentSpacesErrored}
      selection
      onChange={(event, data) => {
        
        const documentSpaceId = data.value?.toString();
        
        if (documentSpaceId != null) {
          const queryParams = new URLSearchParams(location.search);

          if (queryParams.get(spaceIdQueryKey) !== documentSpaceId) {
            queryParams.set(spaceIdQueryKey, documentSpaceId);
            queryParams.delete(pathQueryKey);
            history.push({search: queryParams.toString()});
          }
        }
     }}
      options={getSpaceOptions(props.isDocumentSpacesLoading, props.isDocumentSpacesErrored, props.documentSpaceService)}
    />
  );
}


export default DocumentSpaceSelector;
