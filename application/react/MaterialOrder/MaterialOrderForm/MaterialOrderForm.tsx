import { useState } from 'react';
import './MaterialOrderForm.scss'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { getUsers } from '../../_queries/users';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneMaterialOrder } from '../../_queries/materialOrder';
import { convertDateStringToFormInputDateString } from '../../_helperFunctions/dateTime';
import { performTextSearch } from '../../_queries/_common.ts';
import { IMaterial, IMaterialOrder, IUser, IVendor } from '@shared/types/models.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea.tsx';
import { IMaterialOrderForm } from '@ui/types/forms.ts';
import { MongooseIdStr } from '@shared/types/typeAliases.ts';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator.tsx';
import { useQuery } from '@tanstack/react-query';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const materialOrderTableUrl = '/react-ui/tables/material-order'

export const MaterialOrderForm = () => {
  const { state } = useLocation();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<IMaterialOrderForm>({
    defaultValues: {
      freightCharge: 0,
      fuelCharge: 0,
      ...state || {}
    }
  });
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const [users, setUsers] = useState<SelectOption[]>([])
  const [materials, setMaterials] = useState<SelectOption[]>([])
  const [vendors, setVendors] = useState<SelectOption[]>([])

  const isUpdateRequest: boolean = !!mongooseId && mongooseId.length > 0;

  const { error: formValuesError, isFetching: isFetchingFormValues, isLoading: isLoadingFormValues } = useQuery({
    queryKey: ['material-order', mongooseId],
    queryFn: async () => {
      return await populateFormIfUpdate()
    },
    enabled: isUpdateRequest,
  })

  const { error: materialOrderError, isFetching: isFetchingMaterialOrder, isLoading: isLoadingMaterialOrder } = useQuery({
    queryKey: ['todo'], // !!! TODO !!!: Add queries here, probably need to split this into separate queries to avoid fetching all data each time a search is performed
    queryFn: async () => {
      return await preloadFormData()
    },
  })

  const preloadFormData = async () => {
    const materialSearchResults = await performTextSearch<IMaterial>('/materials/search', { limit: '100' });
    const materials = materialSearchResults.results;
    const users = await getUsers();
    const VendorSearchResults = await performTextSearch<IVendor>('/vendors/search', { limit: '100' });
    const vendors = VendorSearchResults.results;

    setMaterials(materials.map((material: IMaterial) => {
      return {
        displayName: material.name,
        value: material._id as MongooseIdStr
      }
    }))
    setUsers(users.map((user: IUser) => {
      return {
        displayName: user.email,
        value: user._id as MongooseIdStr
      }
    }))
    setVendors(vendors.map((vendor: IVendor) => {
      return {
        displayName: vendor.name,
        value: vendor._id as MongooseIdStr
      }
    }))

    return {
      materials,
      users,
      vendors
    }
  }

  const populateFormIfUpdate = async () => {
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

    return formValues;
  }

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

  if (materialOrderError) useErrorMessage(materialOrderError);
  if (formValuesError) useErrorMessage(formValuesError);
  if (isLoadingFormValues || isLoadingMaterialOrder || isFetchingFormValues || isFetchingMaterialOrder) return <LoadingIndicator />

  return (
    <div id='material-po-form-page-wrapper' className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>Create Material Order</h3>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} data-test='material-order-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
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
              <div className={formStyles.inputGroupWrapper}>
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
                  leftUnit='@storm'
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
              <TextArea
                attribute='notes'
                label="Notes"
                register={register}
                isRequired={false}
                errors={errors}
              />
              {/* Let user know some form inputs had errors */}
              <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>
              <button className='create-entry submit-button' type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MaterialOrderForm;