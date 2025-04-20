import { useEffect } from 'react';
import { Input } from '../../_global/FormInputs/Input/Input';
import { FormProvider, useForm } from 'react-hook-form';
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
import * as formStyles from '@ui/styles/form.module.scss'

const dieTableUrl = '/react-ui/tables/die'

export const DieForm = () => {
  const navigate = useNavigate();
  const { mongooseId } = useParams();
  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  const methods = useForm<IDieForm>();
  const { handleSubmit, formState: { errors }, reset } = methods;

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

  useEffect(() => {
    if (Object.keys(errors).length) {
      useErrorMessage(new Error('Some inputs had errors, please fix before attempting resubmission'))
    }
  }, [errors])

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Die</h3>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} data-test='die-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='dieNumber'
                  label="Die Number"
                  isRequired={true}
                />
                <CustomSelect
                  attribute='shape'
                  label='Shape'
                  options={dieShapes.map((option) => ({ value: option, displayName: option }))}
                  isRequired={true}
                />
                <Input
                  attribute='quantity'
                  label="Quantity"
                  isRequired={true}
                />
                <CustomSelect
                  attribute='status'
                  label='Status'
                  options={dieStatuses.map((option) => ({ value: option, displayName: option }))}
                  isRequired={true}
                />
              </div>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='sizeAcross'
                  label="Size Across"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='sizeAround'
                  label="Size Around"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='numberAcross'
                  label="Number Across"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='numberAround'
                  label="Number Around"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='cornerRadius'
                  label="Corner Radius"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='topAndBottom'
                  label="Across Matrix"
                  isRequired={true}
                  leftUnit='@storm'
                />
                <Input
                  attribute='leftAndRight'
                  label="Around Matrix"
                  isRequired={true}
                  leftUnit='@storm'
                />
              </div>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='gear'
                  label="Gear"
                  isRequired={true}
                />
                <CustomSelect
                  attribute='toolType'
                  label='Tool Type'
                  options={toolTypes.map((option) => ({ value: option, displayName: option }))}
                  isRequired={true}
                />
                <CustomSelect
                  attribute='magCylinder'
                  label='Magnetic Cylinder'
                  options={dieMagCylinders.map((option) => ({ value: String(option), displayName: String(option) }))}
                  isRequired={true}
                />
                <Input
                  attribute='facestock'
                  label="Facestock"
                  isRequired={true}
                />
                <Input
                  attribute='liner'
                  label="Liner"
                  isRequired={true}
                />
                <Input
                  attribute='specialType'
                  label="Special Type"
                  isRequired={false}
                />
              </div>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='cost'
                  label="Cost"
                  isRequired={true}
                  fieldType='currency'
                />
                <CustomSelect
                  attribute='vendor'
                  label='Vendor'
                  options={dieVendors.map((option) => ({ value: option, displayName: option }))}
                  isRequired={true}
                />
                <Input
                  attribute='serialNumber'
                  label="Serial Number"
                  isRequired={true}
                />
                <Input
                  attribute='isLamination'
                  label="Lamination"
                  isRequired={false}
                  fieldType='checkbox'
                />
              </div>
              <TextArea
                attribute='notes'
                label="Notes"
                isRequired={true}
              />

              <button className={sharedStyles.submitButton} type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default DieForm;