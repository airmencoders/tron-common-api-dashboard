import TextInput from '../TextInput/TextInput';
import { TextInputProps } from '../TextInput/TextInputProps';
import { TextInputWithDeleteProps } from './TextInputWithDeleteProps';

function TextInputWithDelete({ ...props }: TextInputProps & TextInputWithDeleteProps) {
  return (
    <TextInput withDelete {...props} />
  );
}

export default TextInputWithDelete;
