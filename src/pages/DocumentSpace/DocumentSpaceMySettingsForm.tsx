import {useHookstate} from '@hookstate/core';
import React, {FormEvent, useEffect} from 'react';
import Form from '../../components/forms/Form/Form';
import {DocumentSpaceRequestDto, DocumentSpaceResponseDto} from '../../openapi';
import {FormActionType} from '../../state/crud-page/form-action-type';
import AuthorizedUserService from "../../state/authorized-user/authorized-user-service";
import SubmitActions from "../../components/forms/SubmitActions/SubmitActions";
import CircleFilledIcon from "../../icons/CircleFilledIcon";
import CircleEmptyIcon from "../../icons/CircleEmptyIcon";

export interface DocumentSpaceMySettingsFormProps {
  documentSpace?: DocumentSpaceRequestDto;
  onSubmit: (selectedDefaultDocumentSpace: string) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  formActionType: FormActionType;
  documentSpaces: DocumentSpaceResponseDto[];
  authorizedUserService: AuthorizedUserService;
}

interface DocumentSpaceMySettingsState {
  selectedDefaultSpaceId: string,
}

export default function DocumentSpaceMySettingsForm(props: DocumentSpaceMySettingsFormProps) {

  const pageState = useHookstate<DocumentSpaceMySettingsState>({
    selectedDefaultSpaceId: ''
  })
  useEffect(()=>{
    const defaultDocumentSpaceId = props.authorizedUserService.authorizedUser?.defaultDocumentSpaceId;
    if(defaultDocumentSpaceId !== undefined){
      pageState.selectedDefaultSpaceId.set(defaultDocumentSpaceId)
    }
  },[props.authorizedUserService.authorizedUser])

  function submitForm (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (props.formActionType === FormActionType.SAVE) {
      props.onSubmit(pageState.selectedDefaultSpaceId.get());
    }
  }

  function setSelectedDocumentSpace (id:string) {
    pageState.selectedDefaultSpaceId.set(id)
  }
  return <Form onSubmit={submitForm}>
    <div id={'header'} style={{width:'calc(100%-48px)', display: "flex", color: '#515B68', borderBottom: '1px solid #E5E5E5', paddingBottom: 6, marginLeft: 32, marginRight: 16}}>
      <div style={{width:'50%', fontSize: 12}}>
        DOCUMENT SPACES
      </div>
      <div style={{width:'50%', fontSize: 12}}>
        SET AS DEFAULT SPACE
      </div>
    </div>
    <div id={'body'} style={{width:'calc(100%-48px)', marginLeft: 32, marginRight: 16}} >
      {props.documentSpaces.map((documentSpace)=>{

        if(documentSpace === undefined){
          return null
        }
        const isDefaultSpace = documentSpace.id === pageState.selectedDefaultSpaceId.get();

        return <div key={documentSpace.id} style={{display:'flex',borderBottom: '1px solid #E5E5E5', paddingBottom: 10, paddingTop: 10}}>
            <div style={{width:'50%', color: '#1B1C22', fontWeight: 400, fontSize: 14 }}>
              {documentSpace.name}
            </div>
            <div data-testid={`${documentSpace.id}-${isDefaultSpace}`} style={{width:'50%', cursor:'pointer'}} onClick={()=>setSelectedDocumentSpace(documentSpace.id)}>
              {isDefaultSpace ? <CircleFilledIcon size={18}/> : <CircleEmptyIcon size={18}/>}
            </div>
          </div>

      })}
    </div>

    <div style={{position:'absolute', bottom:'47px', right: '24px'}}>
      <SubmitActions
      formActionType={props.formActionType}
      variant={2}
      onCancel={props.onCancel}
      isFormValid={true}
      isFormModified={pageState.selectedDefaultSpaceId.get() !== props.authorizedUserService.authorizedUser?.defaultDocumentSpaceId}
      isFormSubmitting={props.isFormSubmitting}
    />
    </div>
  </Form>;
}
