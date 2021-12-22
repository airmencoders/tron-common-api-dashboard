import { State, useHookstate } from '@hookstate/core';
import React, { FormEvent, useEffect } from 'react';
import Button from '../../components/Button/Button';
import Form from '../../components/forms/Form/Form';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import CircleEmptyIcon from '../../icons/CircleEmptyIcon';
import CircleFilledIcon from '../../icons/CircleFilledIcon';
import RemoveIcon from '../../icons/RemoveIcon';
import { DocumentSpaceRequestDto, DocumentSpaceResponseDto } from '../../openapi';
import AuthorizedUserService from '../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import DeleteDocumentSpaceDialog from './DeleteDocumentSpaceDialog';
import './DocumentSpaceMySettings.scss';

export interface DocumentSpaceMySettingsFormProps {
  documentSpace?: DocumentSpaceRequestDto;
  onSubmit: (selectedDefaultDocumentSpace: string) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  formActionType: FormActionType;
  documentSpaces: State<DocumentSpaceResponseDto[]>;
  authorizedUserService: AuthorizedUserService;
  onDocumentSpaceDeleted: () => void;
}

interface DocumentSpaceMySettingsState {
  selectedDefaultSpaceId: string;
  documentSpaceToDelete: string;
  documentSpaceToDeleteId: string;
  showDeleteDialog: boolean;
}

export default function DocumentSpaceMySettingsForm(props: DocumentSpaceMySettingsFormProps) {
  const pageState = useHookstate<DocumentSpaceMySettingsState>({
    selectedDefaultSpaceId: '',
    documentSpaceToDelete: '',
    documentSpaceToDeleteId: '',
    showDeleteDialog: false,
  });

  const authorizedUserService = useAuthorizedUserState();
  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  useEffect(() => {
    const defaultDocumentSpaceId = props.authorizedUserService.authorizedUser?.defaultDocumentSpaceId;
    if (defaultDocumentSpaceId !== undefined ) {
      pageState.selectedDefaultSpaceId.set(defaultDocumentSpaceId);
    }
  }, []);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (props.formActionType === FormActionType.SAVE) {
      props.onSubmit(pageState.selectedDefaultSpaceId.get());
    }
  }

  function setSelectedDocumentSpace(id: string) {
    pageState.selectedDefaultSpaceId.set(id);
  }
  return (
    <Form onSubmit={submitForm} style={{ minWidth: '100%' }}>
      <div id="my-settings-header" className="my-settings-header">
        <div className="my-settings-header-col">DOCUMENT SPACES</div>
        <div className="my-settings-header-col">SET AS DEFAULT SPACE</div>
        {isAdmin ? <div className="my-settings-header-col-centered">REMOVE SPACE</div> : null}
      </div>
      <div id="my-settings-body" className="my-settings-body">
        { !props.documentSpaces.promised && props.documentSpaces.get()?.map((documentSpace) => {
          if (documentSpace === undefined) {
            return null;
          }
          const isDefaultSpace = documentSpace.id === pageState.selectedDefaultSpaceId.get();
          if (documentSpace.id === pageState.selectedDefaultSpaceId.get()) {
            console.log(documentSpace.name);
          }

          return (
            <div key={documentSpace.id} className="my-settings-body-row">
              <div className="my-settings-body-cell">{documentSpace.name}</div>
              <div
                data-testid={`${documentSpace.id}-${isDefaultSpace}`}
                className="my-settings-body-cell-pointer"
                onClick={() => setSelectedDocumentSpace(documentSpace.id)}
              >
                {isDefaultSpace ? <CircleFilledIcon size={18} /> : <CircleEmptyIcon size={18} />}
              </div>
              {isAdmin ? (
                <div className="my-settings-body-cell-remove">
                  <Button
                    id={`remove-docspace-${documentSpace.id}`}
                    data-testid={`remove-docspace-${documentSpace.id}`}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      pageState.merge({
                        documentSpaceToDeleteId: event.currentTarget.id.replace('remove-docspace-', ''),
                        documentSpaceToDelete: documentSpace.name,
                        showDeleteDialog: true,
                      });
                    }}
                    className="remove-button"
                    icon
                    unstyled
                    type="button"
                  >
                    <RemoveIcon size={1.2} />
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <DeleteDocumentSpaceDialog
        docSpaceId={pageState.documentSpaceToDeleteId.value}
        docSpaceName={pageState.documentSpaceToDelete.value}
        onClose={() =>
          pageState.merge({
            documentSpaceToDelete: '',
            documentSpaceToDeleteId: '',
            showDeleteDialog: false,
          })
        }
        show={pageState.showDeleteDialog.value}
        onDocumentSpaceDeleted={props.onDocumentSpaceDeleted}
      />

      <div className="my-settings-submit-section">
        <SubmitActions
          formActionType={props.formActionType}
          variant={2}
          onCancel={props.onCancel}
          isFormValid={true}
          isFormModified={
            pageState.selectedDefaultSpaceId.get() !==
            props.authorizedUserService.authorizedUser?.defaultDocumentSpaceId
          }
          isFormSubmitting={props.isFormSubmitting}
        />
      </div>
    </Form>
  );
}
