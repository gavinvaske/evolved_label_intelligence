import { useEffect, useRef, useState } from 'react';
import { FieldErrors, FieldValues, UseFormRegister, Path, Controller, Control } from 'react-hook-form';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage.tsx';
import clsx from 'clsx';
import * as formStyles from '@ui/styles/form.module.scss'
import * as styles from './CustomSelect.module.scss';
import { FaChevronDown } from "react-icons/fa6";

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
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={clsx(formStyles.customSelectContainer)} ref={dropdownRef}>
      <label>{label}<span className='red'>{isRequired ? '*' : ''}</span>:</label>
      <Controller
        control={control}
        name={attribute}
        render={({ field: { onChange, value } }) => (
          <div>
            {/* Selected Option */}
            <div className={clsx(styles.selectSelected, value && styles.active)} onClick={toggleDropdown}>
              {(value && options.find(option => value == option.value))?.displayName || 'Nothing Selected'}
              <span className={clsx(styles.dropdownArrow, isOpen && styles.active)}><FaChevronDown /></span>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
              <div className={styles.selectItemsDropdown}>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                {/* "Nothing Selected" Option */}
                <DropdownOption
                  className={clsx(styles.borderBottom, !value && styles.sameAsSelected)}
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
                  <div className={clsx(styles.dropdownItem, styles.noResults)}>No options found</div>
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
      className={clsx(styles.dropdownItem, className, isSelected && styles.sameAsSelected)}
      onClick={onClick}

    >
      {option.displayName}
    </div>
  );
}