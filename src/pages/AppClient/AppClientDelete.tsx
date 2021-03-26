import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';

function AppClientDelete(props: DataCrudDeleteComponentProps<AppClientFlat>) {
  const fields: Record<string, string> = {
    "ID": props.data.id || 'Unknown',
    "Name": props.data.name,
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

export default AppClientDelete;
