import React from 'react';
import {ModalProps} from './ModalProps';
import ReactModal from 'react-modal';

import './Modal.scss';
import CloseIcon from '../../icons/CloseIcon';

// required for accesability
ReactModal.setAppElement('#root');

function Modal(props: ModalProps) {
  return (
      <div className="modal-component">
        <ReactModal isOpen={props.show}
                    style={{
                      overlay: {
                        backgroundColor: 'rgba(0,0,0,.25)'
                      },
                      content: {
                        padding: 0,
                        borderRadius: '6px'
                      }
                    }}
        >
          <div className="modal-component__container">
            <div className="modal-component__header">
              {props.headerComponent}
              <div className="header__close-icon" onClick={props.onHide}>
                <CloseIcon size={1.75} />
              </div>
            </div>
            <div className="modal-component__body">
              {props.children}
            </div>
            <div className="modal-component__footer">
              {props.footerComponent}
            </div>
          </div>
        </ReactModal>
      </div>
  );
}

export default Modal;
