import { Textarea } from '@trussworks/react-uswds';
import React from 'react';
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import '../../components/forms/SubmitActions/SubmitActions.scss';
import TextInput from '../../components/forms/TextInput/TextInput';
import { HttpLogEntryDetailsDto } from '../../openapi/models';
import './AuditLogDetailsForm.scss';


function AuditLogDetailsPage(props: CreateUpdateFormProps<HttpLogEntryDetailsDto>) {
  return (
    <div className="audit-log-details-page">
      <Form onSubmit={props.onClose}>
        <FormGroup labelName="requestTimestamp" labelText="Request Timestamp">
          <TextInput id="requestTimestamp" name="requestTimeStamp" type="text"
            defaultValue={props.data?.requestTimestamp || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="requestedUrl" labelText="Requested URL">
          <TextInput id="requestedUrl" name="requestedUrl" type="text"
            defaultValue={props.data?.requestedUrl || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="statusCode" labelText="Status Code">
          <TextInput id="statusCode" name="statusCode" type="text"
            defaultValue={props.data?.statusCode || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="remoteIp" labelText="Remote IP">
          <TextInput id="remoteIp" name="remoteIp" type="text"
            defaultValue={props.data?.remoteIp || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="requestHost" labelText="Request Host">
          <TextInput id="requestHost" name="requestHost" type="text"
            defaultValue={props.data?.requestHost || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="userAgent" labelText="User Agent">
          <TextInput id="userAgent" name="userAgent" type="text"
            defaultValue={props.data?.userAgent || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="queryString" labelText="Query String">
          <TextInput id="queryString" name="queryString" type="text"
            defaultValue={props.data?.queryString || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="timeTakenMs" labelText="Time Taken in ms">
          <TextInput id="timeTakenMs" name="timeTakenMs" type="text"
            defaultValue={props.data?.timeTakenMs || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="userName" labelText="User / App Client">
          <TextInput id="userName" name="userName" type="text"
            defaultValue={props.data?.userName || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="requestMethod" labelText="Request Method">
          <TextInput id="requestMethod" name="requestMethod" type="text"
            defaultValue={props.data?.requestMethod || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="requestBody" labelText="Request Body">
          <Textarea id="requestBody" name="requestBody"
            defaultValue={props.data?.requestBody || ''}
            disabled={true}
          />
        </FormGroup>
        <FormGroup labelName="responseBody" labelText="Response Body">
          <Textarea id="responseBody" name="responseBody"
            defaultValue={props.data?.responseBody || ''}
            disabled={true}
          />
        </FormGroup>        
        <div className="submit-actions button-container" data-testid='audit-log-details-dismiss'>
            <Button
                type="button"                
                className="button-container__submit"
                disabled={false}
                onClick={props.onClose}
            >
                OK
            </Button>
        </div>
      </Form>
    </div>
  );
}

export default AuditLogDetailsPage
