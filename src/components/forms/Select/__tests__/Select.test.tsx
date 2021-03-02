import {render, screen, waitFor} from '@testing-library/react';
import Select from '../Select';

it('should render', async () => {

  render(
      <Select id="test" name="test">
        <option value="option1">Option 1</option>
      </Select>
  );

  await waitFor(
      () => expect(screen.getByText('Option 1')).toBeTruthy()
  );
});
