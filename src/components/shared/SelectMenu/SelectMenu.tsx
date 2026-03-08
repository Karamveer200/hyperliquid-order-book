'use client';

import Select, { StylesConfig, Props as SelectProps } from 'react-select';

export interface CustomSelectOption {
  label: string;
  value: string;
  data?: any;
}

// Custom theme styles for react-select components
export const customSelectTheme = (
  variant: string = 'default',
  menuWidth?: string,
  maxHeight?: string,
  embeddedStyles?: StylesConfig<any, any, any>
) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    background: '#131318',
    border: `1px solid #2d2d2d`,
    boxShadow: 'none',
    borderRadius: '2px',
    minHeight: '44px',

    '&:hover': {
      borderColor: '#2d2d2d',
    },

    ...embeddedStyles?.control?.(provided, state),
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
    maxHeight: maxHeight,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    left: 'auto',
    transform: 'translateX(0)',
    marginTop: '0px',
    ...(menuWidth && {
      width: menuWidth,
      minWidth: menuWidth,
      maxWidth: menuWidth,
    }),
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
      padding: '10px 16px',
      minHeight: 'auto',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2d2d2d' : '#2d2d2d',
      },
    };
  },
  singleValue: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '16px',
    fontWeight: '300',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
    fontSize: '16px',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#c7c7c7',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: '#c7c7c7',
    marginRight: '8px',
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,

    color: '#c7c7c7',

    transform: state.selectProps.menuIsOpen
      ? 'rotate(180deg) translateX(10px)'
      : 'rotate(0deg)',
    transition: 'transform 0.2s ease-in-out',
    padding: '8px 8px 8px 0px',

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
    fontSize: '16px',
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
  maxHeight?: string;
  menuWidth?: string;
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
  maxHeight = '300px',
  onMenuScrollToBottom,
  menuWidth,
  embeddedStyles = {},
  additionalStyles = {},
  ...props
}) => {
  const customSelectStyles: StylesConfig<any, any, any> = {
    ...customSelectTheme(variant, menuWidth, maxHeight, embeddedStyles),
    ...additionalStyles,
  };

  return (
    <Select
      styles={customSelectStyles}
      instanceId={props.instanceId || 'react-select'}
      formatOptionLabel={(option: any) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          className="text-base"
        >
          <span style={{ fontWeight: '300' }}>{option.label}</span>
        </div>
      )}
      menuPortalTarget={
        usePortal && typeof document !== 'undefined' ? document.body : undefined
      }
      menuPosition="fixed"
      menuPlacement="auto"
      {...props}
    />
  );
};
