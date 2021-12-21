import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveDialog from '../SpaceNotFoundDialog';
import SpaceNotFoundDialog from "../SpaceNotFoundDialog";

describe('SpaceNotFoundDialog Tests', () => {

  it('should not render modal when shouldShow is false', () => {
    const {queryByText} = render(
      <SpaceNotFoundDialog
        shouldShow={false}
        onHide={jest.fn}
      />
    );

    expect(queryByText('You do not have access to this space.')).toBeNull();
  });
  it('should render modal when shouldShow is true', () => {
    const {queryByText} = render(
      <SpaceNotFoundDialog
        shouldShow={true}
        onHide={jest.fn}
      />
    );

    expect(queryByText('You do not have access to this space.')).toBeInTheDocument();
  });


});
