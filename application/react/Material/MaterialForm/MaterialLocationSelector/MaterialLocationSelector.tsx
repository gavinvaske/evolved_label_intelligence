import React, { useEffect } from 'react';
import './MaterialLocationSelector.scss'
import { FieldValues, Path, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

const locationRegex = /^[a-zA-Z][1-9][0-9]?$/;

type Props<T extends FieldValues> = {
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
}

const LOCATION_ATTRIBUTE_SELECTOR = 'locations'

export const MaterialLocationSelector = <T extends FieldValues>(props: Props<T>) => {
  const { setValue, getValues } = props
  const [location, setLocation] = React.useState<string>('');
  const [locations, setLocations] = React.useState<string[]>([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  useEffect(() => {
    const currentLocations = getValues(LOCATION_ATTRIBUTE_SELECTOR) || [];
    setLocations(currentLocations);
  }, [getValues(LOCATION_ATTRIBUTE_SELECTOR)]);

  const removeLocation = (locationToRemove) => {
    setLocations(locations.filter((loc) => loc!== locationToRemove));
    setValue(LOCATION_ATTRIBUTE_SELECTOR, locations);
  }

  const addLocation = (e) => {
    e.preventDefault();

    const newLocation = location.trim().toUpperCase();

    if (!newLocation) return;

    if (locations.includes(newLocation)) {
      setErrorMessage('Location already exists');
      return;
    }

    if (!locationRegex.test(newLocation)) {
      setErrorMessage('Location must start with a letter and end with a number between 1 and 99 (Ex: C98)');
    } else {
      setLocations((prevLocations) => {
        const updatedLocations = [...prevLocations, newLocation];
        setValue(LOCATION_ATTRIBUTE_SELECTOR, updatedLocations);
        return updatedLocations;
      });
      setLocation('');
      setErrorMessage('');
    }
  }

  return (
    <div>
      <span className='location-error-message'>{errorMessage}</span>
      <div className='input-wrapper'>
        <label>Location</label>
        <input id='material-location-input' type='text' placeholder='Ex: C13' onChange={(e) => setLocation(e.target.value)}></input>
      </div>
      <button onClick={addLocation}>Click me Location</button>
      <div>
        {locations.map((location, index) => (
          <LocationCard location={location} handleRemoveLocation={removeLocation} key={index} />
        ))}
      </div>
    </div>
  )
}

const LocationCard = ({location, handleRemoveLocation }) => {
  return (
    <div>
      <p>Location: {location} </p>
      <button onClick={() => handleRemoveLocation(location)}>Remove Location</button>
    </div>
  )
}