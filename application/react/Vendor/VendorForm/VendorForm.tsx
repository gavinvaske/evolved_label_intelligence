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
import FormErrorMessage from '../../_global/FormErrorMessage/FormErrorMessage';

const vendorTableUrl = '/react-ui/tables/vendor'

export const VendorForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VendorFormAttributes>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;
  const [isPrimaryAddressSameAsRemittance, setIsPrimaryAddressSameAsRemittance] = useState(true);

  const preloadFormData = async () => {
    if (!isUpdateRequest) return;

    const vendor = await getOneVendor(mongooseId);

    const formValues: VendorFormAttributes = {
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

  const onVendorFormSubmit = (vendor: VendorFormAttributes) => {
    console.log('Submitting vendor form', vendor);
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
    <div id='vendor-form-page-wrapper' className='page-wrapper'>
      <div className='card'>
        <div className='form-card-header'>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Vendor</h3>
        </div>
        <div className='form-wrapper'>
          <form onSubmit={handleSubmit(onVendorFormSubmit)} data-test='vendor-form' className='create-vendor-form'>
            <div className='form-elements-wrapper'>
              <div className='group-field-wrapper'>
                <div className='triple-column-container'>
                  <div className='input-group-wrapper'>
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
                  <div className='input-group-wrapper'>
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
                </div>
              </div>
            </div>

            <label>
              <input
                type="checkbox"
                checked={isPrimaryAddressSameAsRemittance}
                onChange={(e) => setIsPrimaryAddressSameAsRemittance(e.target.checked)}
              />
              Remittance same as Primary Address?
            </label>

            {/* Primary Address Input Fields */}
            <AddressFormAttributes label='Primary Address' attribute='primaryAddress' register={register} errors={errors} />
            {/* Remittance Address Input Fields */}
            {!isPrimaryAddressSameAsRemittance && (
              <AddressFormAttributes label='Remittance Address' attribute='remittanceAddress' register={register} errors={errors} />
              )
            }

            {/* Let user know some form inputs had errors */}
            <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

            <button className='btn-primary' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface AddressInputFieldProps {
  attribute: string;
  label: string;
  register: any;
  errors: any
}
const AddressFormAttributes = (props: AddressInputFieldProps) => {
  const { attribute, register, errors, label } = props;

  if (Object.keys(errors).length > 0) {
    console.log(errors)
  }


  return (
    <div>
      <div className='header'>
        <h2>{label}</h2>
      </div>
      <FormErrorMessage errors={errors} name={attribute}/>
      <div className='input-group-wrapper'>
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

export type VendorFormAttributes = {
  name: string,
  phoneNumber?: string | undefined,
  email?: string | undefined,
  notes?: string | undefined,
  website?: string | undefined,
  primaryAddress: AddressFormAttributes,
  remittanceAddress: AddressFormAttributes | null,
  primaryContactName: string,
  primaryContactPhoneNumber: string,
  primaryContactEmail: string,
  mfgSpecNumber?: string | undefined
}