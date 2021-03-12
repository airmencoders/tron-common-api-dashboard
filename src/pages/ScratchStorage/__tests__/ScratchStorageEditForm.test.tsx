import {render, waitFor, fireEvent} from '@testing-library/react';
import ScratchStorageEditForm from '../ScratchStorageEditForm';
import {ScratchStorageAppRegistryDto} from '../../../openapi/models';
import {FormActionType} from '../../../state/crud-page/form-action-type';

const testScratchStorage: ScratchStorageAppRegistryDto = {
    appName: ''
};

const testValidScratchStorage: ScratchStorageAppRegistryDto = {
  appName: 'Test Scratch Storage App',
}

it('should render', async () => {

    const form = render(
        <ScratchStorageEditForm
            data={testScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            successAction={{
              success: false,
              successMsg: ''
            }}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );
    await waitFor(
        () => expect(form.getByText('App Name')).toBeTruthy()
    );
  });

  it('should not allow submit if app name is not set', async () => {
    const form = render(
        <ScratchStorageEditForm
            data={testScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );
    await waitFor(
        () => expect(form.getByText('Add').closest('button'))
            .toHaveAttribute('disabled')
    );
  });

  it('should allow submit if form is modified', async () => {
    const form = render(
        <ScratchStorageEditForm
            data={testValidScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );

    const appNameInput = await form.getByLabelText('App Name', {selector: 'input'});
    fireEvent.change(appNameInput, { target: { value: 'Test'}});
    await waitFor(
        () => expect(form.getByText('Add').closest('button'))
            .not.toHaveAttribute('disabled')
  );
});