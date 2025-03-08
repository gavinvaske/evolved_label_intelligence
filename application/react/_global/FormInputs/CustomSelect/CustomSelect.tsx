import React, { useEffect, useRef, useState } from 'react';
import './CustomSelect.scss';
import { FieldErrors, FieldValues, UseFormRegister, Path, Controller, Control } from 'react-hook-form';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage.tsx';

export type SelectOption = {
  displayName: string,
  value: string
}

type Props<T extends FieldValues> = {
  attribute: Path<T>,
  options: SelectOption[],
  label: string,
  errors: FieldErrors,
  defaultValue?: string,
  isRequired?: boolean,
  control: Control<T, any>,
  register: UseFormRegister<T>,
}

export const CustomSelect = <T extends FieldValues>(props: Props<T>) => {
  const { attribute, options, label, errors, isRequired, control, register } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  options.sort((a, b) => a.displayName?.localeCompare(b.displayName));

  register(attribute, { required: isRequired ? "Nothing Selected" : undefined });

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm(''); // Reset search when opening
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <label>{label}<span className='red'>{isRequired ? '*' : ''}</span>:</label>
      <Controller
        control={control}
        name={attribute}
        render={({ field: { onChange, value } }) => (
          <div className='input-wrapper'>
            {/* Selected Option */}
            <div className={`select-selected ${value && 'active'}`} onClick={toggleDropdown}>
              {(value && options.find(option => value == option.value))?.displayName || 'Nothing Selected'}
              <span className={`dropdown-arrow ${isOpen ? "active" : ""}`}><i className="fa-regular fa-chevron-down"></i></span>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
              <div className="select-items-dropdown">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                {/* "Nothing Selected" Option */}
                <DropdownOption
                  className={`border-bottom ${!value && "same-as-selected"}`}
                  option={{ displayName: `Nothing Selected`, value: '' }}
                  key={-1}
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                />

                {/* Filtered Options */}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <DropdownOption
                      option={option}
                      isSelected={option.value == value}
                      key={index}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                    />
                  ))
                ) : (
                  <div className="dropdown-item no-results">No options found</div>
                )}
              </div>
            )}
          </div>
        )}
      />
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  );
}

type DropdownOptionProps = {
  option: SelectOption,
  key: number,
  onClick: () => void,
  isSelected?: boolean,
  className?: string,
}

const DropdownOption = ({ option, key, onClick, isSelected, className = '' }: DropdownOptionProps) => {

  return (
    <div
      key={key}
      className={`dropdown-item ${isSelected ? "same-as-selected" : ""} ${className} `}
      onClick={onClick}

    >
      {option.displayName}
    </div>
  );
}