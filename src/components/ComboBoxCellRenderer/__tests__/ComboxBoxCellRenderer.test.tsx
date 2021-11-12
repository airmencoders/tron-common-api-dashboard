import { fireEvent, render, waitFor } from '@testing-library/react';
import { ICellEditorParams } from 'ag-grid-community';
import React from 'react';
import {
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpacePrivilegeDto,
  DocumentSpacePrivilegeDtoTypeEnum,
} from '../../../openapi';
import ComboxBoxCellRenderer from '../ComboBoxCellRenderer';

describe('ComboBox cell renderer tests', () => {
  it('should render given list of items with callback of the selected item data', async () => {
    // mock table row
    const tableRow: DocumentSpaceDashboardMemberResponseDto = {
      email: 'joe@test.com',
      id: 'id',
      privileges: [{ id: '1', type: DocumentSpacePrivilegeDtoTypeEnum.Write }],
    };

    const jestCb = jest.fn();
    let selectedData: DocumentSpaceDashboardMemberResponseDto | undefined = undefined;
    const cb = function (_id: string, priv: string) {
      jestCb();
      selectedData = { ...tableRow, privileges: [{ id: '', type: priv } as DocumentSpacePrivilegeDto] };
    };

    const getHighestPrivForMember = (data: DocumentSpaceDashboardMemberResponseDto): DocumentSpacePrivilegeDtoTypeEnum => {
      if (data.privileges.find(item => item.type === DocumentSpacePrivilegeDtoTypeEnum.Membership)) return DocumentSpacePrivilegeDtoTypeEnum.Membership;
      else if (data.privileges.find(item => item.type === DocumentSpacePrivilegeDtoTypeEnum.Write)) return DocumentSpacePrivilegeDtoTypeEnum.Write;
      else return DocumentSpacePrivilegeDtoTypeEnum.Read;
    }

    const page = render(
      <ComboxBoxCellRenderer
        items={Object.values(DocumentSpacePrivilegeDtoTypeEnum)}
        node={{ data: tableRow } as any}
        selectedItem={(row) => getHighestPrivForMember(row)}
        onChange={cb}
      />
    );

    // write should be selected on initial render
    await waitFor(() => expect(page.getByDisplayValue('WRITE')).toBeTruthy());
    await waitFor(() => expect(page.queryByDisplayValue(/Read/i)).toBeFalsy());
    await waitFor(() => expect(page.queryByDisplayValue(/Membership/i)).toBeFalsy());

    // change rows (person's) privileges, their entity object should have one element in its array
    //  that matches that of the selected item from the combo box
    fireEvent.change(page.getByDisplayValue(/Write/i), { target: { value: 'MEMBERSHIP' } });
    await waitFor(() => expect(jestCb).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(selectedData?.privileges.filter((i) => i.type === 'MEMBERSHIP')).toBeTruthy());
    await waitFor(() => expect(selectedData?.privileges.length).toEqual(1));

    fireEvent.change(page.getByDisplayValue(/Membership/i), { target: { value: 'READ' } });
    await waitFor(() => expect(jestCb).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(selectedData?.privileges.filter((i) => i.type === 'READ')).toBeTruthy());
    await waitFor(() => expect(selectedData?.privileges.length).toEqual(1));
  });
});
