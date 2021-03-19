import { DeleteComponentProps } from '../../components/DataCrudFormPage/DeleteComponentProps';
import { OrganizationDto } from '../../openapi';
import './OrganizationDelete.scss';

function OrganizationDelete (props: DeleteComponentProps<OrganizationDto>) {
  return (
    <div className="organization-delete-container" data-testid="organization-delete">
      <p className="organization-delete-container__action-description">Delete this App Client?</p>
      <table className="organization-delete-container__content-table">
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

export default OrganizationDelete