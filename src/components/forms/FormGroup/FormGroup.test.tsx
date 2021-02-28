import FormGroup from './FormGroup';
import {render, waitFor, screen} from '@testing-library/react';

it('should render', async () => {

  render(
      <FormGroup labelName="formGroup" labelText="Form Group">
        <input />
      </FormGroup>
  );

  await waitFor(
      () => expect(screen.getByText('Form Group')).toBeTruthy()
  );
});
