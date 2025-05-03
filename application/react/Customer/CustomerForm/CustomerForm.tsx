import { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm, FormProvider } from 'react-hook-form';
import { ShippingLocationForm } from '../../ShippingLocation/ShippingLocationForm/ShippingLocationForm';
import { IShippingLocationForm } from '@ui/types/forms';
import { FormModal } from '../../_global/FormModal/FormModal';
import { AddressForm } from '../../Address/AddressForm/AddressForm';
import { ContactForm } from '../Contact/ContactForm/ContactForm';
import ShippingLocationCard from '../../ShippingLocation/ShippingLocationCard/ShippingLocationCard';
import { removeElementFromArray } from '../../utils/state-service';
import ContactCard from '../Contact/ContactCard/ContactCard';

import { ICustomerForm, IAddressForm } from '@ui/types/forms';
import { IContactForm } from '@ui/types/forms';

import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneCustomer } from '../../_queries/customer';

import { performTextSearch } from '../../_queries/_common';
import { ICreditTerm } from '@shared/types/models';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect';
import { TextArea } from '../../_global/FormInputs/TextArea/TextArea';
import AddressListItem from './AddressListItem/AddressListItem';
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as formStyles from '@ui/styles/form.module.scss';
import { MongooseId } from '@shared/types/typeAliases';
import { Button } from '../../_global/Button/Button';
import { DataTable } from '../../_global/DataTable/DataTable';

const customerTableUrl = '/react-ui/tables/customer'

export const CustomerForm = () => {
  const { mongooseId } = useParams();
  const methods = useForm<ICustomerForm>();
  const { handleSubmit, formState: { errors }, reset } = methods;
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  const [showBillingLocationForm, setShowBillingLocationForm] = useState(false);
  const [showShippingLocationForm, setShowShippingLocationForm] = useState(false);
  const [showBusinessLocationForm, setShowBusinessLocationForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [creditTerms, setCreditTerms] = useState<SelectOption[]>([])

  const [shippingLocations, setShippingLocations] = useState<IShippingLocationForm[]>([])
  const [billingLocations, setBillingLocations] = useState<IAddressForm[]>([])
  const [businessLocations, setBusinessLocations] = useState<IAddressForm[]>([])
  const [locations, setLocations] = useState<(IAddressForm)[]>([])
  const [contacts, setContacts] = useState<IContactForm[]>([])

  useEffect(() => {
    setLocations([
      ...billingLocations,
      ...shippingLocations,
      ...businessLocations,
    ])
  }, [billingLocations, shippingLocations, businessLocations]);

  const preloadFormData = async () => {
    const creditTermSearchResults = await performTextSearch<ICreditTerm>('/credit-terms/search', { query: '', limit: '100' })
    const creditTerms = creditTermSearchResults.results
  
    setCreditTerms(creditTerms.map((creditTerm: ICreditTerm) => (
      {
        displayName: creditTerm.description,
        value: creditTerm._id as string
      }
    )))

    if (!isUpdateRequest) return;

    const customer = await getOneCustomer(mongooseId);

    const formValues: ICustomerForm = {
      customerId: customer.customerId,
      name: customer.name,
      overun: customer.overun ? String(customer.overun) : '',
      notes: customer.notes || '',
      creditTerms: (customer.creditTerms as ICreditTerm[])?.map((creditTerm: ICreditTerm) => creditTerm._id) || []
    }

    reset(formValues) // Populates the form with loaded values

    setBusinessLocations(customer.businessLocations as IAddressForm[])
    setBillingLocations(customer.billingLocations as IAddressForm[])
    setShippingLocations(customer.shippingLocations as IShippingLocationForm[])
    setContacts(customer.contacts as unknown as IContactForm[])
  }

  useEffect(() => {
    preloadFormData()
      .catch((error) => {
        navigate(customerTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onCustomerFormSubmit = (customer: ICustomerForm) => {
    customer.businessLocations = businessLocations;
    customer.shippingLocations = shippingLocations;
    customer.contacts = contacts;
    customer.billingLocations = billingLocations;

    if (isUpdateRequest) {
      axios.patch(`/customers/${mongooseId}`, customer)
        .then((_) => {
          navigate(customerTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/customers', customer)
        .then((_: AxiosResponse) => {
          navigate(customerTableUrl)
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


  const hideBillingLocationForm = () => setShowBillingLocationForm(false);
  const hideShippingLocationForm = () => setShowShippingLocationForm(false);
  const hideBusinessLocationForm = () => setShowBusinessLocationForm(false);
  const hideContactForm = () => setShowContactForm(false);

  const onBillingLocationFormSubmit = (billingLocation: IAddressForm) => {
    hideBillingLocationForm();
    setBillingLocations([...billingLocations, billingLocation]);
  };

  const onShippingLocationFormSubmit = (shippingLocation: IShippingLocationForm) => {
    hideShippingLocationForm();
    setShippingLocations([...shippingLocations, shippingLocation]);
  };

  const onBusinessLocationFormSubmit = (businessLocation: IAddressForm) => {
    hideBusinessLocationForm();
    setBusinessLocations([...businessLocations, businessLocation]);
  };

  const onContactFormSubmit = (contact: any) => {
    hideContactForm();
    const contactForm: IContactForm = {
      ...contact,
      location: locations[contact.location]
    }
    setContacts([...contacts, contactForm]);
  }

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Customer</h3>
        </div>
        <div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onCustomerFormSubmit)} data-test='customer-form' className={formStyles.form}>
              <div className={formStyles.formElementsWrapper}>
                <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='customerId'
                  label="Customer ID"
                  isRequired={true}
                />
                <Input
                  attribute='name'
                  label="Name"
                  isRequired={true}
                />
                <Input
                  attribute='overun'
                  label="Overun"
                  isRequired={true}
                  leftUnit='@storm'
                />
              </div>
              <TextArea
                attribute='notes'
                label="Notes"
                isRequired={false}
              />
              <CustomSelect
                attribute='creditTerms'
                label="Credit Term"
                options={creditTerms}
                isRequired={false}
                isMulti={true}
              />
              <DataTable
                title="Business Locations"
                columns={['Name', 'Address', 'Unit #', 'City', 'State', 'Zip', 'Delete']}
                data={businessLocations}
                onAdd={() => setShowBusinessLocationForm(true)}
                onDelete={(index) => removeElementFromArray(index, businessLocations, setBusinessLocations)}
                renderRow={(data, index) => (
                  <AddressListItem
                    data={data}
                    onDelete={() => removeElementFromArray(index, businessLocations, setBusinessLocations)}
                  />
                )}
              />

              <DataTable
                title="Shipping Locations"
                columns={['Freight Acct #', 'Delivery Method', 'Name', 'Street', 'Unit', 'City', 'State', 'Zip', 'Delete']}
                data={shippingLocations}
                onAdd={() => setShowShippingLocationForm(true)}
                onDelete={(index) => removeElementFromArray(index, shippingLocations, setShippingLocations)}
                renderRow={(data, index) => (
                  <ShippingLocationCard
                    data={data}
                    onDelete={() => removeElementFromArray(index, shippingLocations, setShippingLocations)}
                  />
                )}
              />

              <DataTable
                title="Billing Locations"
                columns={['Name', 'Street', 'Unit', 'City', 'State', 'Zip', 'Delete']}
                data={billingLocations}
                onAdd={() => setShowBillingLocationForm(true)}
                onDelete={(index) => removeElementFromArray(index, billingLocations, setBillingLocations)}
                renderRow={(data, index) => (
                  <AddressListItem
                    data={data}
                    onDelete={() => removeElementFromArray(index, billingLocations, setBillingLocations)}
                  />
                )}
              />

              <DataTable
                title="Contacts"
                columns={['Name', 'Phone Number', 'Ext.', 'Email', 'Contact Status', 'Notes', 'Position', 'Location', 'Delete']}
                data={contacts}
                onAdd={() => setShowContactForm(true)}
                onDelete={(index) => removeElementFromArray(index, contacts, setContacts)}
                renderRow={(data, index) => (
                  <ContactCard
                    data={data}
                    onDelete={() => removeElementFromArray(index, contacts, setContacts)}
                  />
                )}
              />

              <Button color="blue">
                {isUpdateRequest ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
          </FormProvider>
        </div>
        {/* Code Below Renders a modal IFF user initiated one to open */}
        <FormModal
          Form={AddressForm}
          isOpen={showBillingLocationForm}
          onSubmit={onBillingLocationFormSubmit}
          onCancel={hideBillingLocationForm}
          title="Add Billing Location"
        />
        <FormModal
          Form={ShippingLocationForm}
          isOpen={showShippingLocationForm}
          onSubmit={onShippingLocationFormSubmit}
          onCancel={hideShippingLocationForm}
          title="Add Shipping Location"
        />
        <FormModal
          Form={AddressForm}
          isOpen={showBusinessLocationForm}
          onSubmit={onBusinessLocationFormSubmit}
          onCancel={hideBusinessLocationForm}
          title="Add Business Location"
        />
        <FormModal
          Form={ContactForm}
          isOpen={showContactForm}
          onSubmit={onContactFormSubmit}
          onCancel={hideContactForm}
          title="Add Contact"
          locations={locations}
        />
      </div>
    </div>
  );
}

export default CustomerForm;