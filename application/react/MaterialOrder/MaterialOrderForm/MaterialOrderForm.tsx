import React, { useEffect, useState } from 'react';
import './MaterialOrderForm.scss'
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { getUsers } from '../../_queries/users';
import { User } from '../../_types/databasemodels/user.ts';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneMaterialOrder } from '../../_queries/materialOrder';
import { convertDateStringToFormInputDateString } from '../../_helperFunctions/dateTime';
import { IMaterialOrder } from '../../../api/models/materialOrder'
import { performTextSearch } from '../../_queries/_common.ts';
import { IMaterial, IVendor } from '@shared/types/models.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea.tsx';
import { IMaterialOrderForm } from '@ui/types/forms.ts';

const materialOrderTableUrl = '/react-ui/tables/material-order'

export const MaterialOrderForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<IMaterialOrderForm>({
    defaultValues: {
      freightCharge: 0,
      fuelCharge: 0
    }
  });
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const [users, setUsers] = useState<SelectOption[]>([])
  const [materials, setMaterials] = useState<SelectOption[]>([])
  const [vendors, setVendors] = useState<SelectOption[]>([])

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  const preloadFormData = async () => {
    const materialSearchResults = await performTextSearch<IMaterial>('/materials/search', { query: '', limit: '100' });
    const materials = materialSearchResults.results;
    const users = await getUsers();
    const VendorSearchResults = await performTextSearch<IVendor>('/vendors/search', { query: '', limit: '100' });
    const vendors = VendorSearchResults.results;

    setMaterials(materials.map((material: IMaterial) => {
      return {
        displayName: material.name,
        value: material._id as string
      }
    }))
    setUsers(users.map((user: User) => {
      return {
        displayName: user.email,
        value: user._id
      }
    }))
    setVendors(vendors.map((vendor: IVendor) => {
      return {
        displayName: vendor.name,
        value: vendor._id as string
      }
    }))

    // The code below deals with populating the fields on the form if a user has selected "edit" on an existing object
    if (!isUpdateRequest) return;

    const materialOrder: IMaterialOrder = await getOneMaterialOrder(mongooseId)

    const formValues: IMaterialOrderForm = {
      author: materialOrder.author,
      material: materialOrder.material,
      vendor: materialOrder.vendor,
      purchaseOrderNumber: materialOrder.purchaseOrderNumber,
      orderDate: convertDateStringToFormInputDateString(materialOrder.orderDate as unknown as string),
      feetPerRoll: materialOrder.feetPerRoll,
      totalRolls: materialOrder.totalRolls,
      totalCost: materialOrder.totalCost,
      hasArrived: Boolean(materialOrder.hasArrived),
      notes: materialOrder.notes || '',
      arrivalDate: convertDateStringToFormInputDateString(materialOrder.arrivalDate as unknown as string),
      freightCharge: materialOrder.freightCharge,
      fuelCharge: materialOrder.fuelCharge
    }

    reset(formValues) // Loads data into the form and forces a rerender
  }

  useEffect(() => {
    preloadFormData()
      .catch((error) => {
        navigate(materialOrderTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: IMaterialOrderForm) => {
    if (isUpdateRequest) {
      axios.patch(`/material-orders/${mongooseId}`, formData)
        .then((_) => {
          navigate(materialOrderTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/material-orders', formData)
      .then((_: AxiosResponse) => {
        navigate(materialOrderTableUrl);
        useSuccessMessage('Creation was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
    }
  }

  return (
    <div id='material-po-form-page-wrapper' className='page-wrapper'>
      <div className='card'>
        <div className='form-card-header'>
          <h3>Create Material Order</h3>
        </div>
        <div className='form-wrapper'>
          <form onSubmit={handleSubmit(onSubmit)} data-test='material-order-form' className='create-material-order-form'>
            <div className='input-group-wrapper'>
              <CustomSelect 
                attribute='author'
                label="Author"
                options={users}
                register={register}
                isRequired={true}
                errors={errors}
                control={control}
              />
              <CustomSelect 
                attribute='material'
                label="Material"
                options={materials}
                register={register}
                isRequired={true}
                errors={errors}
                control={control}
              />
              <CustomSelect 
                attribute='vendor'
                label="Vendors"
                options={vendors}
                register={register}
                isRequired={true}
                errors={errors}
                control={control}
              />
            </div>
            <div className='input-group-wrapper'>
              <Input
                  attribute='purchaseOrderNumber'
                  label="Purchase Order Number"
                  register={register}
                  isRequired={true}
                  errors={errors}
              />
              <Input
                  attribute='orderDate'
                  label="Order Date"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='date'
              />
              <Input
                  attribute='feetPerRoll'
                  label="Feet per Roll"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  unit='@storm'
              />
              <Input
                  attribute='totalRolls'
                  label="Total Rolls"
                  register={register}
                  isRequired={true}
                  errors={errors}
              />
              <Input
                  attribute='totalCost'
                  label="Total Cost"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
              />
              <Input
                  attribute='hasArrived'
                  label="Has Arrived"
                  register={register}
                  isRequired={false}
                  errors={errors}
                  fieldType='checkbox'
              />
              <TextArea
                  attribute='notes'
                  label="Notes"
                  register={register}
                  isRequired={false}
                  errors={errors}
              />
              <Input
                  attribute='arrivalDate'
                  label="Arrival Date"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='date'
              />
              <Input
                  attribute='freightCharge'
                  label="Freight Charge"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
              />
              <Input
                  attribute='fuelCharge'
                  label="Fuel Charge"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
              />
            </div>
            {/* Let user know some form inputs had errors */}
            <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>
            <button className='create-entry submit-button' type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}