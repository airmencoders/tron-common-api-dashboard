import {usePersonState} from '../../../state/person/person-state';
import {createState, useState} from '@hookstate/core';
import {PersonDto, Rank, RankBranchTypeEnum} from '../../../openapi/models';
import {PersonControllerApi, RankControllerApi} from '../../../openapi';
import {RankStateModel} from '../../../state/person/rank-state-model';
import {fireEvent, render, waitFor} from '@testing-library/react';
import PersonEditForm from '../PersonEditForm';
import {FormActionType} from '../../../state/crud-page/form-action-type';
import PersonService from '../../../state/person/person-service';

jest.mock('../../../state/person/person-state');

const testPerson: PersonDto = {
};


class MockPersonService extends PersonService {

  fetchRankForBranch(branch: string) {
    this.rankState.set(ranks => Promise.resolve({
      [branch]: [
        { abbreviation: 'TEST RANK' }
      ] as Rank[]
    }))
  }
}

it('should update the avail ranks if branch changes', async () => {

  let mockUsePersonState =  (usePersonState as jest.Mock).mockImplementation(() => new MockPersonService(
      useState(createState<PersonDto[]>([])),
      new PersonControllerApi(),
      useState(createState<RankStateModel>({})),
      new RankControllerApi()
  ))
  const form = render(
      <PersonEditForm
          data={testPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );

  const branchInput = await form.getByLabelText('Branch', {selector: 'select'});
  fireEvent.change(branchInput, { target: { value: RankBranchTypeEnum.Usa}});
  await waitFor(
      () => {
        const rankInput = form.getByLabelText('Rank', {selector: 'select'});
        expect((rankInput as HTMLSelectElement).value).toBe('TEST RANK');
      }
  )
  mockUsePersonState.mockRestore();
});
