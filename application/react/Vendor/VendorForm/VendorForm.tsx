import React, { useEffect, useState } from 'react';
import './VendorForm.scss'
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneVendor } from '../../_queries/vendors';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';
import { IVendorForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const vendorTableUrl = '/react-ui/tables/vendor'

export const VendorForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IVendorForm>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;
  const [isPrimaryAddressSameAsRemittance, setIsPrimaryAddressSameAsRemittance] = useState(true);

  const preloadFormData = async () => {
    if (!isUpdateRequest) return;

    const vendor = await getOneVendor(mongooseId);

    const formValues: IVendorForm = {
      name: vendor.name,
      phoneNumber: vendor.phoneNumber,
      email: vendor.email,
      notes: vendor.notes,
      website: vendor.website,
      primaryContactName: vendor.primaryContactName,
      primaryContactPhoneNumber: vendor.primaryContactPhoneNumber,
      primaryContactEmail: vendor.primaryContactEmail,
      mfgSpecNumber: vendor.mfgSpecNumber,
      primaryAddress: vendor.primaryAddress,
      remittanceAddress: vendor.remittanceAddress
    }

    if (formValues.remittanceAddress) {
      setIsPrimaryAddressSameAsRemittance(false)
    }

    reset(formValues) // Populates the form with loaded values
  }

  useEffect(() => {
    preloadFormData()
      .catch((error) => {
        useErrorMessage(error)
      })
  }, [])

  const onVendorFormSubmit = (vendor: IVendorForm) => {
    if (isPrimaryAddressSameAsRemittance) {
      vendor.remittanceAddress = null;
    }

    if (isUpdateRequest) {
      axios.patch(`/vendors/${mongooseId}`, vendor)
        .then((_) => {
          navigate(vendorTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/vendors', vendor)
        .then((_: AxiosResponse) => {
          navigate(vendorTableUrl)
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  }

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Vendor</h3>
        </div>
        <div>
          <form onSubmit={handleSubmit(onVendorFormSubmit)} data-test='vendor-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='name'
                  label="Name"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='phoneNumber'
                  label="Phone #"
                  register={register}
                  isRequired={false}
                  errors={errors}
                />
                <Input
                  attribute='email'
                  label="Email"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='website'
                  label="Website"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
              </div>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='primaryContactName'
                  label="P.C Name"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='primaryContactPhoneNumber'
                  label="P.C Phone #"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='primaryContactEmail'
                  label="P.C Email"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='mfgSpecNumber'
                  label="MFG Spec #"
                  register={register}
                  isRequired={false}
                  errors={errors}
                />
              </div>
              <TextArea
                attribute='notes'
                label="Notes"
                register={register}
                isRequired={false}
                errors={errors}
              />

              <div className={formStyles.inputGroupWrapper}>
                <label>
                  <input
                    type="checkbox"
                    checked={isPrimaryAddressSameAsRemittance}
                    onChange={(e) => setIsPrimaryAddressSameAsRemittance(e.target.checked)}
                  />
                  Remittance same as Primary Address?
                </label>
              </div>

              {/* Primary Address Input Fields */}
              <AddressFormAttributes label='Primary Address' attribute='primaryAddress' register={register} errors={errors} />
              {/* Remittance Address Input Fields */}
              {!isPrimaryAddressSameAsRemittance && (
                <AddressFormAttributes label='Remittance Address' attribute='remittanceAddress' register={register} errors={errors} />
              )
              }

              {/* Let user know some form inputs had errors */}
              <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

              <button className='create-entry submit-button' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface AddressProps {
  attribute: string;
  label: string;
  register: any;
  errors: any
}

const AddressFormAttributes = (props: AddressProps) => {
  const { attribute, register, errors, label } = props;

  return (
    <div>
      <div className={formStyles.formCardHeader}>
        <h3>{label}</h3>
      </div>
      <div className={formStyles.inputGroupWrapper}>
        <Input
          attribute={`${attribute}.name`}
          label="Name"
          register={register}
          isRequired={true}
          errors={errors}
        />
        <Input
          attribute={`${attribute}.street`}
          label="Street"
          register={register}
          isRequired={true}
          errors={errors}
        />
        <Input
          attribute={`${attribute}.unitOrSuite`}
          label="Unit or Suite #"
          register={register}
          isRequired={false}
          errors={errors}
        />
        <Input
          attribute={`${attribute}.city`}
          label="City"
          register={register}
          isRequired={true}
          errors={errors}
        />
        <Input
          attribute={`${attribute}.state`}
          label="State"
          register={register}
          isRequired={true}
          errors={errors}
        />
        <Input
          attribute={`${attribute}.zipCode`}
          label="Zip"
          register={register}
          isRequired={true}
          errors={errors}
        />
      </div>
    </div>
  )
}

export default VendorForm;

