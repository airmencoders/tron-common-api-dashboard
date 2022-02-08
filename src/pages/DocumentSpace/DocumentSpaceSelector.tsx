import React, { useEffect } from 'react';
import {useHistory} from 'react-router';
import {useLocation} from 'react-router-dom';
import Select from '../../components/forms/Select/Select';
import Combobox from '../../components/forms/Combobox/Combobox';
import './DocumentSpacePage.scss';
import DocumentSpaceService from "../../state/document-space/document-space-service";
import {DocumentSpaceSelectorProps} from "./DocumentSpaceSelectorProps";
import {useDocumentSpaceGlobalState} from '../../state/document-space/document-space-state';
//mport { Dropdown } from '@trussworks/react-uswds';
import { Dropdown } from 'semantic-ui-react';
import { isPropertySignature } from 'typescript';




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

  function getSpaceOptions(isDocumentSpacesLoading: boolean, isDocumentSpacesErrored: boolean, documentSpaceService: DocumentSpaceService) {
    if (isDocumentSpacesLoading) {
      return (
        <option value="loading">
          Loading...
        </option>
      )
    }

    if (isDocumentSpacesErrored) {
      return (
        <option value="error">
          Could not load Document Spaces
        </option>
      )
    }
    
    if (props.onUnreachableSpace) {
      return [ { id: 'none', name: ' ' }, ...documentSpaceService.documentSpaces].map((item) =>
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
    );
    }
    /*
    return documentSpaceService.documentSpaces.map((item) =>
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    );
    */
   return documentSpaceService.documentSpaces;
    
   //return documentSpaceService.documentSpaces;
    
  }

   
  return (
    <Combobox
      id="document-space"
      name="document-space"
      data-testid="document-space-selector"
      value={props.onUnreachableSpace ? 'none' : props.selectedSpace?.id}
      //text={props.selectedSpace?.name}
      disabled={props.isDocumentSpacesLoading || props.isDocumentSpacesErrored}
      
      onChange={(event, data) => {
        console.log("this isi a test", data.value);
        
        let documentSpaceId;
        //const documentSpaceId = event.target.value;
        if (data.value != undefined){
          documentSpaceId = data.value.toString();
        }
        
        if (documentSpaceId != null) {
          const queryParams = new URLSearchParams(location.search);

          if (queryParams.get(spaceIdQueryKey) !== documentSpaceId) {
            queryParams.set(spaceIdQueryKey, documentSpaceId);
            queryParams.delete(pathQueryKey);
            history.push({search: queryParams.toString()});
          }
        }
        
     }}
     
      
      opts={getSpaceOptions(props.isDocumentSpacesLoading, props.isDocumentSpacesErrored, props.documentSpaceService)}
      
    >
    </Combobox>
  );
}


export default DocumentSpaceSelector;
