import React from "react";

export interface DataCrudDeleteContentProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The type name of the data being deleted
   */
  dataTypeName: string;

  /**
   * The field names and values that should be displayed on the delete confirmation modal.
   */
  fields?: Record<string, string>;
}
