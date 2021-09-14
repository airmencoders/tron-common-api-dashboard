import {DataCrudDeleteComponentProps} from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import {PubSubCollection} from "../../state/pub-sub/pubsub-service";

function PubSubDelete(props: DataCrudDeleteComponentProps<PubSubCollection>) {
  const fields: Record<string, string> = {
    "App Client": props.data.appClientUser || 'Unknown'
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

export default PubSubDelete;
