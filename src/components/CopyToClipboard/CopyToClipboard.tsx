import React from 'react';
import {CopyToClipboardProps} from './CopyToClipboardProps';
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard'

import './CopyToClipboard.scss';
import CopyIcon from "../../icons/CopyIcon";
import Button from "../Button/Button";

// normal functional component HOC pattern
function CopyToClipboard(props: CopyToClipboardProps) {
  const { ...rest } = props;
  return (
    <ReactCopyToClipboard {...rest } >
      <Button type="button" className={'usa-button inline-icon'}>
        <CopyIcon iconTitle={'copyToClipboard'} size={1} />
      </Button>
    </ReactCopyToClipboard>
  );
}

export default CopyToClipboard;
// export const CopyToClipboard = CopyToClipboardW();

// return a class instead of jsx
// function CopyToClipboard(props: CopyToClipboardProps) {
//     const { ...rest } = props;
//
//     return class extends React.Component {
//         render() {
//             return (
//             <ReactCopyToClipboard {...rest } >
//                 <Button type="button" className={'usa-button inline-icon'}>
//                     <CopyIcon iconTitle={'copyToClipboard'} size={1} />
//                 </Button>
//             </ReactCopyToClipboard>
//             )
//         };
//     };
// }
//
// export default CopyToClipboard;

// using a wrapped hoc
// function CopyToClipboardWrapper(ReactCopyToClipboard) {
//
//     return class extends React.Component {
//         render() {
//             return (
//                 <ReactCopyToClipboard {...this.props } >
//                     <Button type="button" className={'usa-button inline-icon'}>
//                         <CopyIcon iconTitle={'copyToClipboard'} size={1} />
//                     </Button>
//                 </ReactCopyToClipboard>
//             )
//         };
//     };
// }

// export const CopyToClipboard = CopyToClipboardWrapper(ReactCopyToClipboard);


