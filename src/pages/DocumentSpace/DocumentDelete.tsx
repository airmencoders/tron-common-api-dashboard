import DataCrudDelete from '../../components/DataCrudFormPage/DataCrudDelete';
import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';

export function DocumentDelete(props: DataCrudDeleteComponentProps<string>) {
  const fields: Record<string, string> = {
    "Name": props.data || 'Unknown',
  };

  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
      fields={fields}
    />
  );
}

interface DeleteDocumentProps {
  show: boolean;
  file: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function DeleteDocumentDialog(props: DeleteDocumentProps) {

  return (
    <DataCrudDelete
      deleteComponent={DocumentDelete}
      data={props.file ?? 'selected items'}
      dataTypeName='item(s)'
      onCancel={props.onCancel}
      disableSubmit={false}
      onSubmit={props.onSubmit}
      show={props.show}
    />
  )
}