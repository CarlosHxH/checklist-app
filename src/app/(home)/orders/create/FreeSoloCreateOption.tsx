import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions<OptionType>();

interface FreeSoloCreateOptionProps {
    label: string;
    options: OptionType[];
    onChange: (value: OptionType | null) => void;
    defaultValue?: string;
    value?: OptionType | string | null;
    required?: boolean;
}

interface OptionType {
    inputValue?: string;
    name: string;
    id?: string | number | undefined;
    //[key: string]: string;
}


export default function FreeSoloCreateOption(props: FreeSoloCreateOptionProps) {
    const [value, setValue] = React.useState<OptionType | null>(null);

    React.useEffect(() => {
        if (props.defaultValue) {
            setValue({ name: props.defaultValue });
        }
    }, [props.defaultValue]);

    React.useEffect(() => {
        if (value) {
            props.onChange(value);
        }
    }, [value,props]);

    const handleChange = (event: React.SyntheticEvent, newValue: OptionType | string | null) => {
        if (typeof newValue === 'string') {
            setValue({ name: newValue });
        } else if (newValue?.inputValue) {
            // Create a new value from user input
            setValue({ name: newValue.inputValue });
        } else {
            setValue(newValue);
        }
    };

    return (
        <Autocomplete
            freeSolo
            fullWidth
            value={value}
            onChange={handleChange}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                
                // Suggest creation of a new value
                const isExisting = options.some(option => inputValue === option.name);
                if (inputValue !== '' && !isExisting) {
                    filtered.push({
                        inputValue,
                        name: `Add "${inputValue}"`,
                    });
                }
                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text"
            options={props.options}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (option.inputValue) return option.inputValue;
                return option.name;
            }}
            renderOption={(props, option) => (
                <li {...props} key={option.id || option.name}>
                    {option.name}
                </li>
            )}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label={props.label} 
                    required={props.required}
                />
            )}
        />
    );
}