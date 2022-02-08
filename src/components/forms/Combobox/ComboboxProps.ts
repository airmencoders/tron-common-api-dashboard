import React, { SyntheticEvent } from 'react';
import { DropdownItemProps, DropdownProps } from 'semantic-ui-react';

export interface ComboboxProps{
    //options: DropdownItemProps[] | undefined;
    opts: any;
    id: string;
    name: string;
    disabled: boolean;
    //text: string | undefined;
    value: string | undefined;
    className?: string;
    fluid?: boolean;
    selection?: boolean;
    children: React.ReactNode;
    onChange: (event: SyntheticEvent<HTMLElement>, data: DropdownProps) => void;
    inputRef?: string | ((instance: HTMLSelectElement | null) => void) | React.RefObject<HTMLSelectElement>;
}