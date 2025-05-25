import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneVendor } from '../../_queries/vendors';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';
import { IVendorForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../_global/Button/Button';
import * as styles from './VendorForm.module.scss'

const vendorTableUrl = '/react-ui/tables/vendor'

export const VendorForm = () => {
  const { mongooseId } = useParams();
  const methods = useForm<IVendorForm>();
  const { handleSubmit, formState: { errors }, reset } = methods;
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

  useEffect(() => {
    if (Object.keys(errors).length) {
      useErrorMessage(new Error('Some inputs had errors, please fix before attempting resubmission'))
    }
  }, [errors])

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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onVendorFormSubmit)} data-test='vendor-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='name'
                  label="Name"
                  isRequired={true}
                />
                <Input
                  attribute='phoneNumber'
                  label="Phone #"
                  isRequired={false}
                />
                <Input
                  attribute='email'
                  label="Email"
                  isRequired={true}
                />
                <Input
                  attribute='website'
                  label="Website"
                  isRequired={true}
                />
              </div>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='primaryContactName'
                  label="P.C Name"
                  isRequired={true}
                />
                <Input
                  attribute='primaryContactPhoneNumber'
                  label="P.C Phone #"
                  isRequired={true}
                />
                <Input
                  attribute='primaryContactEmail'
                  label="P.C Email"
                  isRequired={true}
                />
                <Input
                  attribute='mfgSpecNumber'
                  label="MFG Spec #"
                  isRequired={false}
                />
              </div>
              <TextArea
                attribute='notes'
                label="Notes"
                isRequired={false}
                placeholder='Enter notes here...'
              />

              <div className={styles.checkboxWrapper}>
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
              <AddressFormAttributes label='Primary Address' attribute='primaryAddress' />
              {/* Remittance Address Input Fields */}
              {!isPrimaryAddressSameAsRemittance && (
                <AddressFormAttributes label='Remittance Address' attribute='remittanceAddress' />
              )
              }

              <Button color="blue" size="large" data-test='submit-button'>
                {isUpdateRequest ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

interface AddressProps {
  attribute: string;
  label: string;
}

const AddressFormAttributes = (props: AddressProps) => {
  const { attribute, label } = props;

  return (
    <div>
      <div className={formStyles.formCardHeader}>
        <h3>{label}</h3>
      </div>
      <div className={formStyles.inputGroupWrapper}>
        <Input
          attribute={`${attribute}.name`}
          label="Name"
          isRequired={true}
        />
        <Input
          attribute={`${attribute}.street`}
          label="Street"
          isRequired={true}
        />
        <Input
          attribute={`${attribute}.unitOrSuite`}
          label="Unit or Suite #"
          isRequired={false}
        />
        <Input
          attribute={`${attribute}.city`}
          label="City"
          isRequired={true}
        />
        <Input
          attribute={`${attribute}.state`}
          label="State"
          isRequired={true}
        />
        <Input
          attribute={`${attribute}.zipCode`}
          label="Zip"
          isRequired={true}
        />
      </div>
    </div>
  )
}

export default VendorForm;

