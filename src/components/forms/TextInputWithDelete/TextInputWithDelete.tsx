import TextInput from '../TextInput/TextInput';
import { TextInputProps } from '../TextInput/TextInputProps';
import { TextInputWithDeleteProps } from './TextInputWithDeleteProps';

import './TextInputWithDelete.scss';


function TextInputWithDelete({ ...props }: TextInputProps & TextInputWithDeleteProps) {
  return (
    <TextInput withDelete {...props} />
  );
}

export default TextInputWithDelete;
