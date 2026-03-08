'use client';

import Select, { StylesConfig, Props as SelectProps } from 'react-select';

export interface CustomSelectOption {
  label: string;
  value: string;
}

// Custom theme styles for react-select components
export const customSelectTheme = () => ({
  control: (provided: any, state: any) => ({
    ...provided,
    background: '#131318',
    border: `1px solid #2d2d2d`,
    boxShadow: 'none',
    borderRadius: '2px',
    minHeight: '32px',
    minWidth: '72px',
    padding: '0 6px',

    '&:hover': {
      borderColor: '#2d2d2d',
    },
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    position: 'fixed',
  }),
  menu: (provided: any, state: any) => ({
    ...provided,
    background: '#131318',
    border: `1px solid #2d2d2d`,
    borderRadius: '2px',
    backdropFilter: 'blur(10px)',
    zIndex: 9999,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    left: 'auto',
    transform: 'translateX(0)',
    marginTop: '0px',
  }),
  option: (provided: any, state: any) => {
    return {
      ...provided,
      backgroundColor: state.isSelected
        ? '#2d2d2d'
        : state.isFocused
          ? '#2d2d2d'
          : '#131318',
      color: '#c7c7c7',
      padding: '6px 10px',
      minHeight: 'auto',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      cursor: 'pointer',
      fontSize: '13px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2d2d2d' : '#2d2d2d',
      },
    };
  },
  singleValue: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '13px',
    fontWeight: '300',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '13px',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '13px',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: '#c7c7c7',
    marginRight: '4px',
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    color: '#c7c7c7',
    transform: state.selectProps.menuIsOpen
      ? 'rotate(180deg) translateX(4px)'
      : 'rotate(0deg)',
    transition: 'transform 0.2s ease-in-out',
    padding: '4px 4px 4px 0',

    '&:hover': {
      color: '#c7c7c7',
    },
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
  }),
  loadingIndicator: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '13px',
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '0px',
  }),
});

// Reusable CustomSelect component with built-in theme
interface ReactSelectProps extends SelectProps {
  variant?: 'default';
  usePortal?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  onMenuScrollToBottom?: () => void;
}

interface CustomSelectProps extends ReactSelectProps {
  additionalStyles?: StylesConfig<any, any, any>;
  embeddedStyles?: StylesConfig<any, any, any>;
}

export const SelectMenu: React.FC<CustomSelectProps> = ({
  variant = 'default',
  usePortal = true,
  minDate,
  maxDate,
  onMenuScrollToBottom,
  ...props
}) => {
  const customSelectStyles: StylesConfig<any, any, any> = {
    ...customSelectTheme(),
  };

  return (
    <Select
      styles={customSelectStyles}
      instanceId={props.instanceId || 'react-select'}
      formatOptionLabel={(option: any) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
        >
          <span style={{ fontWeight: '300' }}>{option.label}</span>
        </div>
      )}
      menuPortalTarget={
        usePortal && typeof document !== 'undefined' ? document.body : undefined
      }
      menuPosition="fixed"
      menuPlacement="auto"
      components={{
        IndicatorSeparator: () => null,
      }}
      {...props}
    />
  );
};
