import { DeleteComponentProps } from '../../components/DataCrudFormPage/DeleteComponentProps';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import './DashboardUserDelete.scss';

function DashboardUserDelete(props: DeleteComponentProps<DashboardUserFlat>) {
  return (
    <div className="dashboard-user-delete-container" data-testid="dashboard-user-delete">
      <p className="dashboard-user-delete-container__action">Delete this Dashboard User?</p>
      <table className="dashboard-user-delete-container__content-table">
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
              Email
          </td>
            <td className="content-table__data">
              {props.data?.email}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DashboardUserDelete;
