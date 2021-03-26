import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import { ScratchStorageAppRegistryDto } from '../../openapi';
import './ScratchStorageDelete.scss';

function ScratchStorageDelete(props: DataCrudDeleteComponentProps<ScratchStorageAppRegistryDto>) {
  return (
    <div className="scratch-storage-delete-container" data-testid="scratch-storage-delete">
      <p className="scratch-storage-delete-container__action-description">Delete this Scratch Storage App?</p>
      <table className="scratch-storage-delete-container__content-table">
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
              App Name
          </td>
            <td className="content-table__data">
              {props.data?.appName}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ScratchStorageDelete;
