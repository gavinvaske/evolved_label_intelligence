import React, { useEffect } from 'react';
import './DieForm.scss';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { getOneDie } from '../../_queries/die';
import { dieShapes } from '../../../api/enums/dieShapesEnum';
import { toolTypes } from '../../../api/enums/toolTypesEnum';
import { dieVendors } from '../../../api/enums/dieVendorsEnum';
import { dieMagCylinders } from '../../../api/enums/dieMagCylindersEnum';
import { dieStatuses } from '../../../api/enums/dieStatusesEnum';
import { CustomSelect } from '../../_global/FormInputs/CustomSelect/CustomSelect';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';
import { IDieForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'

const dieTableUrl = '/react-ui/tables/die'

export const DieForm = () => {
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<IDieForm>({
    defaultValues: {
      quantity: 1,
      isLamination: true
    }
  });

  useEffect(() => {
    preloadFormData()
      .catch((error) => {
        useErrorMessage(error)
      })
  }, [])

  const preloadFormData = async () => {
    if (!isUpdateRequest) return;

    const die = await getOneDie(mongooseId);

    const formValues: IDieForm = {
      dieNumber: die.dieNumber,
      shape: die.shape,
      sizeAcross: die.sizeAcross,
      sizeAround: die.sizeAround,
      numberAcross: die.numberAcross,
      numberAround: die.numberAround,
      gear: die.gear,
      toolType: die.toolType,
      notes: die.notes,
      cost: die.cost,
      vendor: die.vendor,
      magCylinder: die.magCylinder,
      cornerRadius: die.cornerRadius,
      topAndBottom: die.topAndBottom,
      leftAndRight: die.leftAndRight,
      facestock: die.facestock,
      liner: die.liner,
      specialType: die.specialType || '',
      serialNumber: die.serialNumber,
      status: die.status,
      quantity: die.quantity,
      isLamination: die.isLamination
    }

    reset(formValues) // Loads data into the form and forces a rerender
  }

  const onSubmit = (formData: IDieForm) => {
    if (isUpdateRequest) {
      axios.patch(`/dies/${mongooseId}`, formData)
        .then((_) => {
          navigate(dieTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/dies', formData)
        .then((_: AxiosResponse) => {
          navigate(dieTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  }

  return (
    <div id='die-form-page-wrapper' className={sharedStyles.pageWrapper}>
      <div className='card'>
        <div className='form-card-header'>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Die</h3>
        </div>
        <div className='form-wrapper'>
          <form onSubmit={handleSubmit(onSubmit)} data-test='die-form' className='create-die-form'>
            <div className='input-group-wrapper'>
              <Input
                attribute='dieNumber'
                label="Die Number"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <CustomSelect
                attribute='shape'
                label='Shape'
                options={dieShapes.map((option) => ({ value: option, displayName: option }))}
                register={register}
                errors={errors}
                isRequired={true}
                control={control}
              />
              <Input
                attribute='quantity'
                label="Quantity"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <CustomSelect
                attribute='status'
                label='Status'
                options={dieStatuses.map((option) => ({ value: option, displayName: option }))}
                register={register}
                errors={errors}
                isRequired={true}
                control={control}
              />
            </div>
            <div className='input-group-wrapper'>
              <Input
                attribute='sizeAcross'
                label="Size Across"
                register={register}
                errors={errors}
                isRequired={true}
                leftUnit='@storm'
              />
              <Input
                attribute='sizeAround'
                label="Size Around"
                register={register}
                errors={errors}
                isRequired={true}
                leftUnit='@storm'
              />
              <Input
                attribute='numberAcross'
                label="Number Across"
                register={register}
                errors={errors}
                isRequired={true}
                  leftUnit='@storm'
              />
              <Input
                attribute='numberAround'
                label="Number Around"
                register={register}
                errors={errors}
                isRequired={true}
                leftUnit='@storm'
              />
              <Input
              attribute='cornerRadius'
              label="Corner Radius"
              register={register}
              errors={errors}
              isRequired={true}
              leftUnit='@storm'
            />
            <Input
              attribute='topAndBottom'
              label="Across Matrix"
              register={register}
              errors={errors}
              isRequired={true}
              leftUnit='@storm'
            />
            <Input
              attribute='leftAndRight'
              label="Around Matrix"
              register={register}
              errors={errors}
              isRequired={true}
              leftUnit='@storm'
            />
            </div>
            <div className='input-group-wrapper'>
              <Input
                attribute='gear'
                label="Gear"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <CustomSelect
                attribute='toolType'
                label='Tool Type'
                options={toolTypes.map((option) => ({ value: option, displayName: option }))}
                register={register}
                errors={errors}
                isRequired={true}
                control={control}
              />
                <CustomSelect
                attribute='magCylinder'
                label='Magnetic Cylinder'
                options={dieMagCylinders.map((option) => ({ value: String(option), displayName: String(option) }))}
                register={register}
                errors={errors}
                isRequired={true}
                control={control}
              />
              <Input
                attribute='facestock'
                label="Facestock"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                attribute='liner'
                label="Liner"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                attribute='specialType'
                label="Special Type"
                register={register}
                errors={errors}
                isRequired={false}
              />
            </div>
            <div className='input-group-wrapper'>
              <Input
                attribute='cost'
                label="Cost"
                register={register}
                errors={errors}
                isRequired={true}
                fieldType='currency'
              />
              <CustomSelect
                attribute='vendor'
                label='Vendor'
                options={dieVendors.map((option) => ({ value: option, displayName: option }))}
                register={register}
                errors={errors}
                isRequired={true}
                control={control}
              />
              <Input
                attribute='serialNumber'
                label="Serial Number"
                register={register}
                errors={errors}
                isRequired={true}
              />
              <Input
                  attribute='isLamination'
                  label="Lamination"
                  register={register}
                  isRequired={false}
                  errors={errors}
                  fieldType='checkbox'
              />
            </div>
            <TextArea
              attribute='notes'
              label="Notes"
              register={register}
              errors={errors}
              isRequired={true}
            />
            {/* Let user know some form inputs had errors */}
            <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

            <div className='btn-wrapper'>
              <button className='create-entry submit-button' type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DieForm;