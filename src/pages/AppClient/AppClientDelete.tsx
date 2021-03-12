import { DeleteComponentProps } from '../../components/DataCrudFormPage/DeleteComponentProps';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import './AppClientDelete.scss';

function AppClientDelete(props: DeleteComponentProps<AppClientFlat>) {
  return (
    <div className="app-client-delete-container" data-testid="app-client-delete">
      <p className="app-client-delete-container__action-description">Delete this App Client?</p>
      <table className="app-client-delete-container__content-table">
        <tbody>
          <tr className="content-table__row">
            <td className="content-table__data">
              ID
          </td>
            <td className="content-table__data">
              {props.data?.id}
            </td>
          </tr>
          <tr className="content-table__row">
            <td className="content-table__data">
              Name
          </td>
            <td className="content-table__data">
              {props.data?.name}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AppClientDelete;
