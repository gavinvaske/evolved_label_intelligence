import React, { useState, useEffect } from 'react';
import './MaterialInput.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import quoteStore from '../../../../stores/quoteStore.ts';
import { observer } from 'mobx-react-lite';
import { DropdownField } from '../InputFields/DropdownField/DropdownField.tsx';
import TextField from '../InputFields/TextField/TextField.js';
import { IMaterial } from '@shared/types/models';
import { useErrorMessage } from '../../../../_hooks/useErrorMessage.ts';

type Props = {
  isPrimaryMaterial: boolean
}

const MaterialInput = observer((props: Props) => {
  const { isPrimaryMaterial } = props;
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const { quoteInputs } = quoteStore;

  const updateMaterial = (e, attributeName) => {
    if (isPrimaryMaterial) {
      quoteInputs.primaryMaterialOverride[attributeName] = Number(e.target.value);
    } else {
      quoteInputs.secondaryMaterialOverride[attributeName] = Number(e.target.value);
    }
  }

  const computeTotalCostMsi = (isPrimaryMaterial, quoteStore) => {
    let material = isPrimaryMaterial ? 'primaryMaterialOverride' : 'secondaryMaterialOverride';

    const costPerMsi = quoteStore.quoteInputs[material].costPerMsi || 0;
    const freightMsi = quoteStore.quoteInputs[material].freightCostPerMsi || 0;
    const quotePricePerMsi = quoteStore.quoteInputs[material].quotePricePerMsi || 0;

    return (costPerMsi + freightMsi + quotePricePerMsi).toFixed(4);
  }

  useEffect(() => {
    axios.get(`/materials`)
      .then((response: AxiosResponse) => setMaterials(response.data))
      .catch((error: AxiosError) => useErrorMessage(error))
  }, [])

  return (
    <div className='material-input-section card'>
        <DropdownField header={isPrimaryMaterial ? 'Primary Material' : 'Secondary Material'} options={materials.map((material) => material.name)}/>
      <div className='column'>
        <TextField accessor={'costPerMsi'} header={'Initial Cost MSI'} onChange={(e) => updateMaterial(e, 'costPerMsi')}/>
      </div>
      <div className='column'>
        <TextField accessor={'freightCostPerMsi'} header={'Freight MSI'} onChange={(e) => updateMaterial(e, 'freightCostPerMsi')}/>
      </div>
      <div className='column'>
        <TextField header={'Total Cost MSI'} value={computeTotalCostMsi(isPrimaryMaterial, quoteStore)} isReadOnly={true}/>
      </div>
      <div className='column'>
        <TextField accessor={'quotePricePerMsi'} header={'Quoted MSI'} onChange={(e) => updateMaterial(e, 'quotePricePerMsi')}/>
      </div>
      <div className='column'>
        <TextField accessor={'thickness'} header={'Thickness'} onChange={(e) => updateMaterial(e, 'thickness')}/>
      </div>
    </div>
  )
})

export default MaterialInput