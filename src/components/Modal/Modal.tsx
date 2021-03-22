import React from 'react';
import {ModalProps} from './ModalProps';
import ReactModal from 'react-modal';

import './Modal.scss';
import CloseIcon from '../../icons/CloseIcon';

// required for accessibility
ReactModal.setAppElement('body');

function Modal(props: ModalProps) {
  return (
      <div className="modal-component">
        <ReactModal isOpen={props.show}
                    style={{
                      overlay: {
                        backgroundColor: 'rgba(0,0,0,.25)',
                        zIndex: 10000,
                        display: 'flex',
                      },
                      content: {
                        width: props.width || '75%',
                        margin: 'auto',
                        height:  props.height || '50%',
                        padding: 0,
                        borderRadius: '6px'
                      },
                    }}
                    className="modal-component__react-modal"
        >
          <div className="modal-component__container">
            <div className="modal-component__header">
              {props.headerComponent}
              <button className="header__close-icon close-btn" onClick={props.onHide}
                      title="close-modal">
                <CloseIcon size={1.75} />
              </button>
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
