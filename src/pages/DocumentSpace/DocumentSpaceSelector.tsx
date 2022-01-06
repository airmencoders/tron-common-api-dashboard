import React, { useEffect } from 'react';
import {useHistory} from 'react-router';
import {useLocation} from 'react-router-dom';
import Select from '../../components/forms/Select/Select';
import './DocumentSpacePage.scss';
import DocumentSpaceService from "../../state/document-space/document-space-service";
import {DocumentSpaceSelectorProps} from "./DocumentSpaceSelectorProps";
import {useDocumentSpaceGlobalState} from '../../state/document-space/document-space-state';


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

    return documentSpaceService.documentSpaces.map((item) =>
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    );
  }

  return (
    <Select
      id="document-space"
      name="document-space"
      data-testid="document-space-selector"
      value={props.onUnreachableSpace ? 'none' : props.selectedSpace?.id}
      disabled={props.isDocumentSpacesLoading || props.isDocumentSpacesErrored}
      onChange={(event) => {
        const documentSpaceId = event.target.value;
        if (documentSpaceId != null) {
          const queryParams = new URLSearchParams(location.search);

          if (queryParams.get(spaceIdQueryKey) !== documentSpaceId) {
            queryParams.set(spaceIdQueryKey, documentSpaceId);
            queryParams.delete(pathQueryKey);
            history.push({search: queryParams.toString()});
          }
        }
      }}
    >
      {getSpaceOptions(props.isDocumentSpacesLoading, props.isDocumentSpacesErrored, props.documentSpaceService)}
    </Select>
  );
}

export default DocumentSpaceSelector;
