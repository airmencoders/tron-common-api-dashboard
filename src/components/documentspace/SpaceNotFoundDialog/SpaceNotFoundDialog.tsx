import React from 'react';
import {SpaceNotFoundDialogProps} from './SpaceNotFoundDialogProps';
import Modal from "../../Modal/Modal";
import LockIcon from "../../../icons/LockIcon";
import { isMobile } from 'react-device-detect';


function SpaceNotFoundDialog(props: SpaceNotFoundDialogProps) {

  return (
    <Modal
      headerComponent={undefined}
      footerComponent={undefined}
      show={props.shouldShow}
      onHide={props.onHide}
      height={isMobile ? '15' : '35%'}
      width={isMobile ? '15' : '33%'}
    >
      <div style={{
        height: '100%',
        width: '100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
      }}>
        <div style={{
          marginLeft:'auto', marginRight:'auto', marginBottom: '1rem'
        }}>
          <LockIcon size={1.5}/>
        </div>
        <div style={{
          marginLeft:'5rem',
          marginRight:'5rem',
          textAlign:'center',
          fontSize:'18px'
        }}>
          You do not have access to this space or it does not exist.
        </div>
      </div>
    </Modal>
  )
}

export default SpaceNotFoundDialog;