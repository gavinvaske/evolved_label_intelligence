import React, { forwardRef } from 'react'
import * as styles from './SearchBar.module.scss'

type Props = {
  value: string,
  performSearch: (value: string) => void,
  instantSearch?: boolean,
  onFocus?: () => void,
  onBlur?: () => void
}

const SearchBar = forwardRef((props: Props, inputRef: any) => {
  const { value, performSearch, instantSearch = false, onFocus, onBlur } = props;

  const handleUserTypedSomething = (userInput: string) => {
    if (instantSearch) {
      performSearch(userInput.trim());
    }
  }

  const handleButtonPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value || '';
    searchIffEnterWasPressed(e, userInput)
    searchIffInputIsNowEmpty(e, userInput)
  }

  const searchIffEnterWasPressed = (e: React.KeyboardEvent<HTMLInputElement>, userInput: string) => {
    if (e.key === 'Enter') {
      performSearch(userInput.trim())
    }
  }

  const searchIffInputIsNowEmpty = (e: React.KeyboardEvent<HTMLInputElement>, userInput: string) => {
    if (userInput.trim() === '') {
      performSearch('')
    }
  }

  return (
    <div className={styles.searchBar} data-test='searchbar'>
      <input
        ref={inputRef}
        id='primarySearch'
        type='text'
        defaultValue={value}
        onKeyUp={handleButtonPressed}
        onChange={(e) => handleUserTypedSomething(e.currentTarget.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search"
      />
    </div>
  )
})

export default SearchBar