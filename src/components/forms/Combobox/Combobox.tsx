import { Dropdown } from 'semantic-ui-react';
import { ComboboxProps } from './ComboboxProps'

function Combobox(props: ComboboxProps){
    
    const values = []
    if(props.opts.length != undefined){
        for(let i = 0; i < props.opts.length; i++){
            values.push({value: props.opts[i].id, text: props.opts[i].name, key: props.opts[i].id})
        }
    }
    return (
        <div className="combobox-component">
            <Dropdown 
                {...props}
                selection
                options={values}
            />
        </div>
    )
}

export default Combobox;