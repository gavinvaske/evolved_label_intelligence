import React, { useEffect, useState } from 'react';
import './VendorForm.scss'
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm } from 'react-hook-form';
import { FormModal } from '../../_global/FormModal/FormModal';
import { AddressForm } from '../../Address/AddressForm/AddressForm';
import AddressCard from '../../Address/AddressCard/AddressCard';
import { AddressFormAttributes } from '../../Address/AddressForm/AddressForm';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneVendor } from '../../_queries/vendors';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';

const vendorTableUrl = '/react-ui/tables/vendor'

export const VendorForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<VendorFormAttributes>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<AddressFormAttributes | null>();

    const preloadFormData = async () => {  
      if (!isUpdateRequest) return;

      const vendor = await getOneVendor(mongooseId);
  
      setAddress(vendor.address);
  
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
    if (!address) { 
      setError("address", {
        type: "manual",
        message: "Address is required",
      });
      return;
    }
  
    vendor.address = address;

    if (isUpdateRequest) {
      axios.patch(`/vendors/${mongooseId}`, vendor)
        .then((_) => {
          navigate(vendorTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/vendors', vendor)
        .then((_ : AxiosResponse) => {
          navigate(vendorTableUrl)
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  }

  const onAddressFormSubmit = (address: AddressFormAttributes) => {
    setShowAddressForm(false);
    setAddress(address)
  };

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

            <h3>Address:</h3>
            <div className='tbl-pri'>
            <div className='tbl-hdr'>
              <div className='tbl-cell'>Name</div>
              <div className='tbl-cell'>Street</div>
              <div className='tbl-cell'>Apt/Unit</div>
              <div className='tbl-cell'>City</div>
              <div className='tbl-cell'>State</div>
              <div className='tbl-cell'>Zip</div>
              <div className='tbl-cell'>Action</div>
            </div>
            {errors.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
            {address && <AddressCard 
              data={address} 
              onDelete={() => setAddress(null)}
            />}
            </div>
            <button className='add-new-row' type="button" onClick={() => setShowAddressForm(true)}><i className="fa-solid fa-plus"></i> Add Address</button>

            <button className='btn-primary' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>

        {/* Address Modal */}
        {
          showAddressForm &&
          <FormModal
            Form={AddressForm}
            onSubmit={onAddressFormSubmit}
            onCancel={() => setShowAddressForm(false)}
          />
        }
      </div>
    </div>
  );
}

export type VendorFormAttributes = {
      name: string,
      phoneNumber?: string,
      email?: string,
      notes?: string,
      website?: string,
      address: AddressFormAttributes,
      primaryContactName: string,
      primaryContactPhoneNumber: string,
      primaryContactEmail: string,
      mfgSpecNumber?: string
}