import React from "react";

export interface DataCrudDeleteContentProps extends React.HTMLAttributes<HTMLElement> {
  dataTypeName: string;
  fields?: Record<string, string>;
}
