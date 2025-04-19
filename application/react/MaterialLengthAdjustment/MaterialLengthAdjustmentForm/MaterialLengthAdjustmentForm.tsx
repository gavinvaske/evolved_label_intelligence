import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { IMaterial } from '@shared/types/models.ts';
import { performTextSearch } from '../../_queries/_common.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea.tsx';
import { IMaterialLengthAdjustmentForm } from '@ui/types/forms.ts';
import { useQuery } from '@tanstack/react-query';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator.tsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

export const MaterialLengthAdjustmentForm = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<SelectOption[]>([])
  const { mongooseId } = useParams();
  const { state } = useLocation();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<IMaterialLengthAdjustmentForm>({
    defaultValues: {
      ...state || {}
    }
  });
  const isUpdateRequest: boolean = !!mongooseId && mongooseId.length > 0;

  const { isFetching: isFetchingFormToUpdate, isLoading: isLoadingFormToUpdate, error: fetchingFormError } = useQuery<IMaterialLengthAdjustmentForm>({
    queryKey: ['material-length-adjustments', mongooseId],
    queryFn: async () => {
      const { data } = await axios.get('/material-length-adjustments/' + mongooseId)
      const formValues: IMaterialLengthAdjustmentForm = {
        material: data.material,
        length: data.length,
        notes: data.notes,
      }

      reset(formValues) // pre-populate form with existing values from the DB
      return formValues
    },
    enabled: isUpdateRequest
  })

  const { isFetching: isFetchingMaterials, isLoading: isLoadingMaterials, error: fetchingMaterialsError } = useQuery<IMaterial[]>({
    queryKey: ['materials-search'],
    queryFn: async () => {
      const { results: materials } = await performTextSearch<IMaterial>('/materials/search', { limit: '100' })
      setMaterials(materials.map((material: IMaterial) => (
        {
          displayName: material.name,
          value: material._id as string
        }
      )))

      return materials
    },
  })

  const onFormSubmit = (formData: IMaterialLengthAdjustmentForm) => {
    if (isUpdateRequest) {
      axios.patch(`/material-length-adjustments/${mongooseId}`, formData)
        .then((_) => {
          navigate('/react-ui/tables/material-length-adjustment');
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    } else {
      axios.post('/material-length-adjustments', formData)
        .then((_: AxiosResponse) => {
          navigate('/react-ui/tables/material-length-adjustment')
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  }

  useEffect(() => {
    if (Object.keys(errors).length) {
      useErrorMessage(new Error('Some inputs had errors, please fix before attempting resubmission'))
    }
  }, [errors])

  if (fetchingMaterialsError) useErrorMessage(fetchingMaterialsError)
  if (fetchingFormError) useErrorMessage(fetchingFormError)

  if (isLoadingFormToUpdate || isLoadingMaterials || isFetchingFormToUpdate || isFetchingMaterials) {
    return <LoadingIndicator />
  }

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>Create Material Adjustment</h3>
        </div>
        <div>
          <form onSubmit={handleSubmit(onFormSubmit)} data-test='material-length-adjustment-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <CustomSelect
                  attribute='material'
                  label="Material"
                  options={materials}
                  register={register}
                  isRequired={true}
                  errors={errors}
                  control={control}
                />
                <Input
                  attribute='length'
                  label="Length"
                  register={register}
                  isRequired={true}
                  errors={errors}
                  leftUnit='@storm'
                />
              </div>
              <TextArea
                attribute='notes'
                label="Notes"
                register={register}
                isRequired={false}
                errors={errors}
              />

              <button className={sharedStyles.submitButton} type="submit">{isUpdateRequest ? 'Update' : 'Create'} </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MaterialLengthAdjustmentForm;