import { DataCrudDeleteContentProps } from "./DataCrudDeleteContentProps";

function DataCrudDeleteContent(props: DataCrudDeleteContentProps) {
  const { dataTypeName, fields } = props;

  return (
    <div className="data-crud-delete-container" data-testid="data-crud-delete-content">
      <p className="data-crud-delete-container__action-description">Delete this {dataTypeName}?</p>
      {fields &&
        <table className="data-crud-delete-container__content-table">
          <tbody>
            {
              Object.entries(fields).map(([key, value]) => {
                return (
                  <tr key={key} className="content-table__row">
                    <td className="content-table__data">
                      {key}
                    </td>
                    <td className="content-table__data">
                      {value}
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      }
    </div>
  );
}

export default DataCrudDeleteContent;
