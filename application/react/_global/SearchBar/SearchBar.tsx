import React, { forwardRef, useState } from 'react'
import './SearchBar.scss'

type Props = {
  value: string,
  performSearch: (value: string) => void,
  instantSearch?: boolean
}

const SearchBar = forwardRef((props: Props, ref: any) => {
  const { value, performSearch, instantSearch = false } = props;
  const [inputValue, setInputValue] = useState(value);

  const handleUserTypedSomething = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value
    setInputValue(userInput)

    if (instantSearch) {
      performSearch(userInput.trim());
    }
  }

  const searchIffEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(inputValue.trim())
    }
  }

  return (
    <div className={value ? 'search-bar has-text' : 'search-bar'} data-test='searchbar'>
      <input ref={ref} id='primarySearch' type='text' defaultValue={value} onKeyDown={searchIffEnterPressed} onChange={handleUserTypedSomething} placeholder="Search" />
    </div>
  )
})

export default SearchBar