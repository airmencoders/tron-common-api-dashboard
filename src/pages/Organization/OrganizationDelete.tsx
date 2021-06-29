import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import { OrganizationDto } from '../../openapi';
import { OrganizationDtoWithDetails } from '../../state/organization/organization-state';

function OrganizationDelete(props: DataCrudDeleteComponentProps<OrganizationDtoWithDetails | OrganizationDto>) {
  const fields: Record<string, string> = {
    "ID": props.data.id || 'Unknown',
    "Name": props.data.name || 'Unknown',
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

export default OrganizationDelete
