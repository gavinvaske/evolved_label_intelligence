import React, { useState, useEffect } from 'react';
import './DieInput.scss';
import { DropdownField } from '../InputFields/DropdownField/DropdownField.tsx';
import TextField from '../InputFields/TextField/TextField.js';
import quoteStore from '../../../../stores/quoteStore.ts';
import axios, { AxiosError } from 'axios';
import { IDie } from '@shared/types/models';
import { useErrorMessage } from '../../../../_hooks/useErrorMessage.ts';

{
  /* TODO @Gavin (9-17-2027): 
    1) Can this page be converted to use react-hook-form
    2) if yes, then can I deprecate and remove the <DropdownField> and <TextField> components
  */
}
const Die = (props) => {
  const dieOverride = quoteStore.quoteInputs.dieOverride as IDie;
  const [ dies, setDies ] = useState<IDie[]>([]);

  useEffect(() => {
    axios.get(`/dies`)
      .then((response) => {
        const { data } = response;
        setDies(data)
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }, [])

  return (
    <div className='die-input-section card'>
        <DropdownField options={dies.map((die) => die.dieNumber)} header='Die Name'/>
      <div className='column'>
        <TextField accessor={'sizeAcross'} header={'Size Across'} onChange={(e) => dieOverride.sizeAcross = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'sizeAround'} header={'Size Around'} onChange={(e) => dieOverride.sizeAround = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'cornerRadius'} header={'Corner Radius'} onChange={(e) => dieOverride.cornerRadius = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'shape'} header={'Shape'} onChange={(e) => dieOverride.shape = e.target.value}/>
      </div>
      <div className='column'>
        <TextField accessor={'colSpace'} header={'Col Space'} onChange={(e) => dieOverride.spaceAcross = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'rowSpace'} header={'Row Space'} onChange={(e) => dieOverride.spaceAround = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'numberAround'} header={'Number Around'} onChange={(e) => dieOverride.numberAround = Number(e.target.value)}/>
      </div>
      <div className='column'>
        <TextField accessor={'numberAcross'} header={'Number Across'} onChange={(e) => dieOverride.numberAcross = Number(e.target.value)}/>
      </div>
    </div>
  )
};

export default Die