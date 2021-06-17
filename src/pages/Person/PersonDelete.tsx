import { DataCrudDeleteComponentProps } from '../../components/DataCrudFormPage/DataCrudDeleteComponentProps';
import DataCrudDeleteContent from '../../components/DataCrudFormPage/DataCrudDeleteContent';
import { PersonDto } from '../../openapi';

function PersonDelete(props: DataCrudDeleteComponentProps<PersonDto>) {
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

export default PersonDelete
