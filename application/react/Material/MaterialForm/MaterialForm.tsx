import React, { useEffect, useState } from 'react';
import './MaterialForm.scss'
import { useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { IAdhesiveCategory, ILinerType, IMaterial, IMaterialCategory, IVendor } from '@shared/types/models.ts';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { MongooseId } from "@shared/types/typeAliases.ts";
import { useAxios } from '../../_hooks/useAxios';
import { performTextSearch } from '../../_queries/_common.ts';
import { SearchResult } from '@shared/types/http.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { IMaterialForm } from '@ui/types/forms.ts';
import { useQuery } from '@tanstack/react-query';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator.tsx';

const materialTableUrl = '/react-ui/tables/material'
const locationRegex = /^[a-zA-Z][1-9][0-9]?$/;

export const MaterialForm = () => {
  const { register, handleSubmit, formState: { errors }, setError, reset, control } = useForm<IMaterialForm>();
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const axios = useAxios();

  const isUpdateRequest: boolean = !!mongooseId && mongooseId.length > 0;

  const [vendors, setVendors] = useState<SelectOption[]>([])
  const [materialCategories, setMaterialCategories] = useState<SelectOption[]>([])
  const [adhesiveCategories, setAdhesiveCategories] = useState<SelectOption[]>([])
  const [linerTypes, setLinerTypes] = useState<SelectOption[]>([])

  const { isFetching, isLoading, error } = useQuery<IMaterialForm>({
    queryKey: ['materials', mongooseId],
    queryFn: async () => {
      const { data } = await axios.get('/materials/' + mongooseId)
      const formValues: IMaterialForm = {
        name: data.name,
        materialId: data.materialId,
        thickness: data.thickness,
        weight: data.weight,
        costPerMsi: data.costPerMsi,
        freightCostPerMsi: data.freightCostPerMsi,
        width: data.weight,
        faceColor: data.faceColor,
        adhesive: data.adhesive,
        quotePricePerMsi: data.quotePricePerMsi,
        description: data.description,
        whenToUse: data.whenToUse,
        alternativeStock: data.alternativeStock || '',
        length: data.length,
        facesheetWeightPerMsi: data.facesheetWeightPerMsi,
        adhesiveWeightPerMsi: data.adhesiveWeightPerMsi,
        linerWeightPerMsi: data.linerWeightPerMsi,
        locationsAsStr: data.locations.join(', '),
        productNumber: data.productNumber,
        masterRollSize: data.masterRollSize,
        image: data.image,
        linerType: data.linerType,
        adhesiveCategory: data.adhesiveCategory,
        vendor: data.vendor as MongooseId,
        materialCategory: data.materialCategory,
        lowStockThreshold: data.lowStockThreshold,
        lowStockBuffer: data.lowStockBuffer
      }

      reset(formValues) // pre-populate form with existing values from the DB
      return formValues
    },
    enabled: isUpdateRequest
  })

  useEffect(() => {
    performTextSearch<IVendor>('/vendors/search', { query: '', limit: '100' })
      .then((response: SearchResult<IVendor>) => {
        const vendors = response.results
        setVendors(vendors.map((vendor: IVendor) => (
          {
            displayName: vendor.name,
            value: vendor._id as string
          }
        )))
      })
      .catch((error: AxiosError) => useErrorMessage(error))

    performTextSearch<IMaterialCategory>('/material-categories/search', { query: '', limit: '100' })
      .then((response: SearchResult<IMaterialCategory>) => {
        const materialCategories = response.results
        setMaterialCategories(materialCategories.map((materialCategory: IMaterialCategory) => (
          {
            displayName: materialCategory.name,
            value: materialCategory._id as string
          }
        )))
      })
      .catch((error: AxiosError) => useErrorMessage(error))

    performTextSearch<IAdhesiveCategory>('/adhesive-categories/search', { query: '', limit: '100' })
      .then((response: SearchResult<IAdhesiveCategory>) => {
        const adhesiveCategories = response.results
        setAdhesiveCategories(adhesiveCategories.map((adhesiveCategory: IAdhesiveCategory) => (
          {
            displayName: adhesiveCategory.name,
            value: adhesiveCategory._id as string
          }
        )))
      })
      .catch((error: AxiosError) => useErrorMessage(error))

    performTextSearch<ILinerType>('/liner-types/search', { query: '', limit: '100' })
      .then((response: SearchResult<ILinerType>) => {
        const linerTypes = response.results
        setLinerTypes(linerTypes.map((linerType: ILinerType) => (
          {
            displayName: linerType.name,
            value: linerType._id as string
          }
        )))
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }, [])

  const onSubmit = (formData: IMaterialForm) => {
    const locationsAsStr = formData.locationsAsStr?.trim()

    formData.locations = locationsAsStr?.length ? locationsAsStr.split(',').map((location: string) => location.trim().toUpperCase()) : [];
    delete formData.locationsAsStr; // locationsAsStr is not needed in the request body.
    formData.locations.sort((a: string, b: string) => {
      const [aAlpha = '', aNum = ''] = a.match(/([A-Z]+)(\d+)/)?.slice(1) as string[];
      const [bAlpha = '', bNum = ''] = b.match(/([A-Z]+)(\d+)/)?.slice(1) as string[];

      if (aAlpha !== bAlpha) {
        return aAlpha.localeCompare(bAlpha);
      }
      return Number(aNum) - Number(bNum);
    })

    if (!formData.locations?.every((location) => locationRegex.test(location))) {
      setError('locationsAsStr', { message: 'Must be in the format: A1, B2, C33' });
      return;
    }
    if (isUpdateRequest) {
      axios.patch(`/materials/${mongooseId}`, formData)
        .then((_) => {
          navigate(materialTableUrl);
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    } else {
      axios.post(`/materials`, formData)
        .then((_) => {
          navigate(materialTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  if (error) {
    useErrorMessage(error);
  }

  if (isLoading || isFetching) return <LoadingIndicator />

  return (
    <div className='page-wrapper'>
      <div className='card'>
        <div className='form-card-header'>
          <h3>{isUpdateRequest ? 'Edit' : 'Create'} Material</h3>
        </div>
        <div className='form-wrapper'>
          <form id='material-form' className='material-form' onSubmit={handleSubmit(onSubmit)} data-test='material-form'>
            <div className='form-elements-wrapper'>
              <div className='input-group-wrapper'>
                <Input
                  attribute='name'
                  label="Name"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='materialId'
                  label="Material ID"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='width'
                  label="Width"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                  rightUnit='@storm'
                />
                <CustomSelect
                  attribute='vendor'
                  label="Vendor"
                  options={vendors}
                  register={register}
                  isRequired={true}
                  errors={errors}
                  control={control}
                />
                <Input
                  attribute='locationsAsStr'
                  label="Locations (comma-separated)"
                  register={register}
                  isRequired={false}
                  errors={errors}
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='thickness'
                  label="Thickness"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='weight'
                  label="Weight"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='faceColor'
                  label="Face Color"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='adhesive'
                  label="Adhesive"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='freightCostPerMsi'
                  label="Freight Cost (per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
                />
                <Input
                  attribute='costPerMsi'
                  label="Cost (per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
                />
                <Input
                  attribute='quotePricePerMsi'
                  label="Quote Price (Per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  fieldType='currency'
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='lowStockThreshold'
                  label="Low Stock Threshold"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='lowStockBuffer'
                  label="Low Stock Buffer"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='description'
                  label="Description"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='whenToUse'
                  label="When-to-use"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='alternativeStock'
                  label="Alternative Stock"
                  register={register}
                  isRequired={false}
                  errors={errors}
                />
              </div>
              <div className='input-group-wrapper'>
                <Input
                  attribute='length'
                  label="Length"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='facesheetWeightPerMsi'
                  label="Facesheet Weight (Per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='adhesiveWeightPerMsi'
                  label="Adhesive Weight (Per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='linerWeightPerMsi'
                  label="Liner Weight (Per MSI)"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
                <Input
                  attribute='productNumber'
                  label="Product Number"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='masterRollSize'
                  label="Master Roll Size"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                  unit={'mm'}
                />
                <Input
                  attribute='image'
                  label="Image"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <CustomSelect
                  attribute='linerType'
                  label="Liner Type"
                  options={linerTypes}
                  register={register}
                  isRequired={true}
                  errors={errors}
                  control={control}
                />
                <CustomSelect
                  attribute='adhesiveCategory'
                  label="Adhesive Category"
                  options={adhesiveCategories}
                  register={register}
                  isRequired={true}
                  errors={errors}
                  control={control}
                />
                <CustomSelect
                  attribute='materialCategory'
                  label="Material Category"
                  options={materialCategories}
                  register={register}
                  isRequired={true}
                  errors={errors}
                  control={control}
                />
              </div>
              {/* Let user know some form inputs had errors */}
              <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

              <button className='create-entry submit-button' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}