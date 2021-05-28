import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import { SubscriberDto } from '../../openapi';

function PubSubDelete(props: DataCrudDeleteComponentProps<SubscriberDto>) {
  const fields: Record<string, string> = {
    "ID": props.data.id || 'Unknown'
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

export default PubSubDelete;
