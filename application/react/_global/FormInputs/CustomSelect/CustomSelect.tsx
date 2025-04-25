import { useEffect, useRef, useState } from 'react';
import { FieldValues, Path, Controller, useFormContext, RegisterOptions } from 'react-hook-form';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage.tsx';
import clsx from 'clsx';
import * as formStyles from '@ui/styles/form.module.scss'
import * as styles from './CustomSelect.module.scss';
import { FaChevronDown } from "react-icons/fa6";
import * as textStyles from '@ui/styles/typography.module.scss';

export type SelectOption = {
  displayName: string,
  value: string
}

type Props<T extends FieldValues> = {
  attribute: Path<T>,
  options: SelectOption[],
  label: string,
  defaultValue?: string,
  isRequired?: boolean,
  isMulti?: boolean,
}

const NOTHING_SELECTED_MESSAGE = 'Nothing Selected';

export const CustomSelect = <T extends FieldValues>(props: Props<T>) => {
  const { attribute, options, label, isRequired, isMulti } = props;
  const formContext = useFormContext();
  const { register, formState: { errors }, control } = formContext;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  options.sort((a, b) => a.displayName?.localeCompare(b.displayName));

  register(attribute, { required: isRequired ? NOTHING_SELECTED_MESSAGE : undefined } as RegisterOptions);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      <label className={styles.customSelectLabel}>{label}<span className={clsx(textStyles.textRed, styles.requiredIndicator)}>{isRequired ? '*' : ''}</span></label>
      <Controller
        control={control}
        name={attribute}
        render={({ field: { onChange, value } }) => (
          <div>
            {/* Selected Option */}
            <div className={clsx(styles.selectSelected, value && styles.active)} onClick={toggleDropdown}>
              {isMulti ? (
                value && value.length > 0 ? value.map((val: string) => options.find(option => val === option.value)?.displayName).join(', ') : NOTHING_SELECTED_MESSAGE
              ) : (
                (value && options.find(option => value == option.value))?.displayName || NOTHING_SELECTED_MESSAGE
              )}
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
                  option={{ displayName: NOTHING_SELECTED_MESSAGE, value: '' }}
                  key={-1}
                  onClick={() => {
                    onChange(isMulti ? [] : '');
                    setIsOpen(false);
                  }}
                />

                {/* Filtered Options */}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <DropdownOption
                      option={option}
                      isSelected={isMulti ? value?.includes(option.value) : option.value == value}
                      key={index}
                      onClick={() => {
                        if (isMulti) {
                          const newValue = value ? [...value] : [];
                          if (newValue.includes(option.value)) {
                            // Remove the option if it's already selected
                            onChange(newValue.filter(val => val !== option.value));
                          } else {
                            // Add the option if it's not selected
                            newValue.push(option.value);
                            onChange(newValue);
                          }
                        } else {
                          onChange(option.value);
                        }
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