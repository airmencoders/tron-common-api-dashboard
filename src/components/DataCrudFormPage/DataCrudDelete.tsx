import React from 'react';
import Modal from '../Modal/Modal';
import ModalTitle from '../Modal/ModalTitle';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';
import './DataCrudDelete.scss';
import { DataCrudDeleteProps } from './DataCrudDeleteProps';

function DataCrudDelete<T>({ deleteComponent: DeleteComponent, ...props }: DataCrudDeleteProps<T>) {
  return (
    <Modal
      headerComponent={<ModalTitle title="Delete Confirmation" />}
      footerComponent={<ModalFooterSubmit
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
        submitText="Delete"
        disableSubmit={props.disableSubmit}
      />}
      show={props.show}
      onHide={props.onCancel}
      width="auto"
      height="auto"
    >
      <DeleteComponent data={props.data} dataTypeName={props.dataTypeName} />

      {props.errors?.general &&
        <div className="data-crud-delete-errors">
          <p className="data-crud-delete-errors__message">
            Error: {props.errors.general}
          </p>
        </div>
      }
    </Modal>
  )
}

export default DataCrudDelete;