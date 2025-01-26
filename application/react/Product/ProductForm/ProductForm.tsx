import React, { useEffect, useState } from 'react';
import './ProductForm.scss';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MongooseId } from '../../_types/typeAliases';
import { unwindDirections } from '../../../api/enums/unwindDirectionsEnum';
import { ovOrEpmOptions } from '../../../api/enums/ovOrEpmEnum';
import { defaultFinishType, finishTypes } from '../../../api/enums/finishTypesEnum';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { SelectOption } from '../../_global/FormInputs/Select/Select';
import { getCustomers } from '../../_queries/customer';
import { getOneProduct } from '../../_queries/product';
import { getFinishes } from '../../_queries/finish';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { defaultUnwindDirection } from '../../../api/enums/unwindDirectionsEnum';
import { defaultOvOrEpm } from '../../../api/enums/ovOrEpmEnum';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';
import { CustomSelect } from '../../_global/FormInputs/CustomSelect/CustomSelect';
import { performTextSearch } from '../../_queries/_common';
import { IDie, IMaterial } from '@shared/types/models';

const productTableUrl = '/react-ui/tables/product'

export const ProductForm = () => {
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  const [dies, setDies] = useState<SelectOption[]>([])
  const [materials, setMaterials ] = useState<SelectOption[]>([])
  const [finishes, setFinishes ] = useState<SelectOption[]>([])
  const [customers, setCustomers ] = useState<SelectOption[]>([])

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ProductFormAttributes>({
    defaultValues: {
      unwindDirection: defaultUnwindDirection,
      ovOrEpm: defaultOvOrEpm,
      finishType: defaultFinishType,
      coreDiameter: 3,
      labelsPerRoll: 1000,
      spotPlate: false
    },
  });

  const preloadFormData = async () => {
    const diesSearchResults = await performTextSearch<IDie>('/dies/search', { limit: '100',  });
    const dies = diesSearchResults.results
    const materialSearchResults = await performTextSearch<IMaterial>('/materials/search', { limit: '100',  });
    const materials = materialSearchResults.results
    const customers = await getCustomers();
    const finishes = await getFinishes();

    setDies(dies.map((die) => ({ value: die._id as string, displayName: die.dieNumber || 'N/A' })));
    setMaterials(materials.map((material) => ({ value: material._id as string, displayName: material.name || 'N/A' })));
    setFinishes(finishes.map((finish) => ({ value: finish._id, displayName: finish.name || 'N/A' })));
    setCustomers(customers.map((customer) => ({ value: customer._id as string, displayName: `${customer.customerId || 'N/A'}` })));

    if (!isUpdateRequest) return;

    const product = await getOneProduct(mongooseId)

    const formValues: ProductFormAttributes = {
      productDescription: product.productDescription,
      unwindDirection: product.unwindDirection,
      ovOrEpm: product.ovOrEpm,
      artNotes: product.artNotes,
      pressNotes: product.pressNotes,
      finishType: product.finishType,
      coreDiameter: product.coreDiameter,
      labelsPerRoll: product.labelsPerRoll,
      dieCuttingNotes: product.dieCuttingNotes,
      overun: product.overun,
      spotPlate: product.spotPlate,
      numberOfColors: product.numberOfColors,
      die: product.die,
      primaryMaterial: product.primaryMaterial,
      secondaryMaterial: product.secondaryMaterial,
      finish: product.finish,
      customer: product.customer
    }

    reset(formValues) // Loads data into the form and forces a rerender
  }


  useEffect(() => {
    preloadFormData()
      .catch((error) => {
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: ProductFormAttributes) => {
    if (isUpdateRequest) {
      axios.patch(`/products/${mongooseId}`, formData)
        .then((_) => {
          navigate(productTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/products', formData)
        .then((_: AxiosResponse) => {
          navigate(productTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  return (
    <div id='product-form-page-wrapper' className='page-wrapper'>
      <div className='card'>
        <div className='form-card-header'>
          <h3>{isUpdateRequest ? 'Update' : 'Create New'} Product</h3>
        </div>
        <div className='form-wrapper'>
          <form onSubmit={handleSubmit(onSubmit)} data-test='product-form'>
            <CustomSelect 
              attribute='customer'
              label="Customer"
              options={customers}
              register={register}
              errors={errors}
              control={control}
              isRequired={true}
            />
            <Input
              attribute='productDescription'
              label="Product Description"
              register={register}
              errors={errors}
              isRequired={true}
            />
            <div className='triple-column-wrapper'>
              <CustomSelect
                attribute='unwindDirection'
                label='Unwind Direction'
                options={unwindDirections.map((direction) => ({ value: String(direction), displayName: String(direction) }))}
                register={register}
                errors={errors}
                control={control}
                isRequired={true}
              />
              <CustomSelect
                attribute='ovOrEpm'
                label='OV / EPM'
                options={ovOrEpmOptions.map((option) => ({ value: option, displayName: option }))}
                register={register}
                errors={errors}
                control={control}
                isRequired={true}
              />
              <CustomSelect
                attribute='finishType'
                label='Finish Types'
                options={finishTypes.map((finishType) => ({ value: finishType, displayName: finishType }))}
                register={register}
                errors={errors}
                control={control}
                isRequired={true}
              />
            </div>
            <div className='quad-column-wrapper'>
              <CustomSelect 
                attribute='die'
                label="Die"
                options={dies}
                register={register}
                errors={errors}
                control={control}
                isRequired={true}
              />
              <CustomSelect 
                attribute='primaryMaterial'
                label="Primary Material"
                options={materials}
                register={register}
                errors={errors}
                control={control}
                isRequired={true}
              />
              <CustomSelect 
                attribute='secondaryMaterial'
                label="Secondary Material"
                options={materials}
                register={register}
                errors={errors}
                control={control}
              />
              <CustomSelect 
                attribute='finish'
                label="Finish"
                options={finishes}
                register={register}
                errors={errors}
                control={control}
              />
            </div>
            <div className='quad-column-wrapper'>
              <Input
                attribute='coreDiameter'
                label="Core Diameter"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                attribute='labelsPerRoll'
                label="Labels Per Roll"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                attribute='overun'
                label="Overun"
                register={register}
                errors={errors}
              />
              <Input
                attribute='numberOfColors'
                label="Number of Colors"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
              attribute='spotPlate'
              label="Has Spot Plate"
              register={register}
              errors={errors}
              fieldType='checkbox'
            />
            </div>
            <TextArea
              attribute='artNotes'
              label="Art Notes"
              register={register}
              errors={errors}
            />
            <TextArea
              attribute='pressNotes'
              label="Press Notes"
              register={register}
              errors={errors}
            />
            <TextArea
              attribute='dieCuttingNotes'
              label="Die Cutting Notes"
              register={register}
              errors={errors}
            /> 

            <button className='create-entry submit-button' type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

type ProductFormAttributes = {
  productDescription: string;
  unwindDirection: number;
  ovOrEpm: string;
  artNotes: string;
  pressNotes: string;
  finishType: string;
  coreDiameter: number;
  labelsPerRoll: number;
  dieCuttingNotes: string;
  overun: number;
  spotPlate: boolean;
  numberOfColors: number;
  die: MongooseId;
  primaryMaterial: MongooseId;
  secondaryMaterial: MongooseId;
  finish: MongooseId;
  customer: MongooseId;
}