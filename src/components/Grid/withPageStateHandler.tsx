import React, {useEffect, useRef} from 'react';
import {GridProps} from "./GridProps";
import {GridApi} from "ag-grid-community";
import {useNavCollapsed} from "../../hooks/PagePreferenceHooks";

export function withPageStateHandler<T extends GridProps>(Component: React.FunctionComponent<T>): (props: T) => React.ReactElement {

    return function WithPageStateHandler(props) {
        const [isNavCollapsed] = useNavCollapsed();

        const gridApi = useRef<GridApi | undefined>(undefined);

        const onGridReady = (api?: GridApi) => {
            gridApi.current = api;
            if (props.onGridReady != null) {
                props.onGridReady(api);
            }
        }

        useEffect(() => {
            if (gridApi.current != null) {
                setTimeout(() => {
                    gridApi.current?.sizeColumnsToFit();
                }, 100);
            }
        }, [isNavCollapsed]);
        return <Component {...props} onGridReady={onGridReady} />;
    }
}