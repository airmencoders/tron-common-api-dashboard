import React from 'react';
import {ModalProps} from './ModalProps';
import ReactModal from 'react-modal';

import './Modal.scss';
import CloseIcon from '../../icons/CloseIcon';
import CloseIcon2 from '../../icons/CloseIcon2';
import Button from '../../components/Button/Button';

// required for accessibility
ReactModal.setAppElement('body');

function Modal(props: ModalProps) {
  return (
      <div className="modal-component">
        <ReactModal isOpen={props.show}
                    style={{
                      overlay: {
                        backgroundColor: 'rgba(0,0,0,.25)',
                        zIndex: 9998,
                        display: 'flex',
                      },
                      content: {
                        width: props.width || '75%',
                        margin: 'auto',
                        height:  props.height || '50%',
                        padding: 0,
                        borderRadius: '6px',
                        overflow: 'auto'
                      },
                    }}
        className={`modal-component__react-modal ${props.className ?? ''}`}
        >
          <div className="modal-component__container">
            <div className="modal-component__header">
              {props.headerComponent}
              <Button 
                className="header__close-icon close-btn" 
                onClick={props.onHide}
                unstyled
                disableMobileFullWidth
                type="button"
                title="close-modal"
              >
                <CloseIcon2 iconTitle="close" size={1} />
              </Button>
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
