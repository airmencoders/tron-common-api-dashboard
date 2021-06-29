import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import {DashboardUserDto} from '../../openapi/models';

function DashboardUserDelete(props: DataCrudDeleteComponentProps<DashboardUserFlat | DashboardUserDto>) {
  const fields: Record<string, string> = {
    "ID": props.data.id || 'Unknown',
    "Email": props.data.email || 'Unknown',
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

export default DashboardUserDelete;
