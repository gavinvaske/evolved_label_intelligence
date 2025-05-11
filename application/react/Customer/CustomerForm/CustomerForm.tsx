import { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm, FormProvider } from 'react-hook-form';
import { ShippingLocationForm } from '../../ShippingLocation/ShippingLocationForm/ShippingLocationForm';
import { IShippingLocationForm } from '@ui/types/forms';
import { FormModal } from '../../_global/FormModal/FormModal';
import { AddressForm } from '../../Address/AddressForm/AddressForm';
import { ContactForm } from '../Contact/ContactForm/ContactForm';
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
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as formStyles from '@ui/styles/form.module.scss';
import { Button } from '../../_global/Button/Button';
import { DataTable } from '../../_global/DataTable/DataTable';
import DataTableRow from '../../_global/DataTable/DataTableRow/DataTableRow';
import { generateMongooseId } from '@ui/utils/mongoose.ts';

const customerTableUrl = '/react-ui/tables/customer'

const businessLocationColumns = [
  { displayName: 'Name', accessor: 'name' },
  { displayName: 'Address', accessor: 'street' },
  { displayName: 'Unit #', accessor: 'unitOrSuite' },
  { displayName: 'City', accessor: 'city' },
  { displayName: 'State', accessor: 'state' },
  { displayName: 'Zip', accessor: 'zipCode' },
  { displayName: 'Edit', accessor: 'edit' },
  { displayName: 'Delete', accessor: 'delete' }
];

const shippingLocationColumns = [
  { displayName: 'Freight Acct #', accessor: 'freightAccountNumber' },
  { displayName: 'Delivery Method', accessor: 'deliveryMethod' },
  { displayName: 'Name', accessor: 'name' },
  { displayName: 'Street', accessor: 'street' },
  { displayName: 'Unit', accessor: 'unitOrSuite' },
  { displayName: 'City', accessor: 'city' },
  { displayName: 'State', accessor: 'state' },
  { displayName: 'Zip', accessor: 'zipCode' },
  { displayName: 'Edit', accessor: 'edit' },
  { displayName: 'Delete', accessor: 'delete' }
];

const billingLocationColumns = [
  { displayName: 'Name', accessor: 'name' },
  { displayName: 'Street', accessor: 'street' },
  { displayName: 'Unit', accessor: 'unitOrSuite' },
  { displayName: 'City', accessor: 'city' },
  { displayName: 'State', accessor: 'state' },
  { displayName: 'Zip', accessor: 'zipCode' },
  { displayName: 'Edit', accessor: 'edit' },
  { displayName: 'Delete', accessor: 'delete' }
];

const contactColumns = [
  { displayName: 'Name', accessor: 'fullName' },
  { displayName: 'Phone Number', accessor: 'phoneNumber' },
  { displayName: 'Ext.', accessor: 'phoneExtension' },
  { displayName: 'Email', accessor: 'email' },
  { displayName: 'Contact Status', accessor: 'contactStatus' },
  { displayName: 'Notes', accessor: 'notes' },
  { displayName: 'Position', accessor: 'position' },
  { displayName: 'Edit', accessor: 'edit' },
  { displayName: 'Delete', accessor: 'delete' }
];

export type BusinessLocationFormWithId = {_id: string} & IAddressForm;
export type ShippingLocationFormWithId = {_id: string} & IShippingLocationForm;
export type BillingLocationFormWithId = {_id: string} & IAddressForm;
type ContactFormWithId = {_id: string} & IContactForm;

type LocationFormWithId = BusinessLocationFormWithId | ShippingLocationFormWithId | BillingLocationFormWithId;

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

  const [editingBillingLocation, setEditingBillingLocation] = useState<BillingLocationFormWithId | null>(null);
  const [editingShippingLocation, setEditingShippingLocation] = useState<ShippingLocationFormWithId | null>(null);
  const [editingBusinessLocation, setEditingBusinessLocation] = useState<BusinessLocationFormWithId | null>(null);
  const [editingContact, setEditingContact] = useState<ContactFormWithId | null>(null);

  const [shippingLocations, setShippingLocations] = useState<ShippingLocationFormWithId[]>([])
  const [billingLocations, setBillingLocations] = useState<BillingLocationFormWithId[]>([])
  const [businessLocations, setBusinessLocations] = useState<BusinessLocationFormWithId[]>([])
  const [locations, setLocations] = useState<(IAddressForm | ShippingLocationFormWithId)[]>([])
  const [contacts, setContacts] = useState<ContactFormWithId[]>([])

  useEffect(() => {
    setLocations([
      ...billingLocations,
      ...shippingLocations,
      ...businessLocations,
    ])
  }, [billingLocations, shippingLocations, businessLocations]);

  console.log('locations:', locations)

  const handleLocationDelete = (_id: string, locations: LocationFormWithId[], setLocations: (locations: LocationFormWithId[]) => void) => {
    const location = locations.find(({_id}) => _id === _id)
    const isLocationInUse = location && contacts.some(contact => {
      return String(contact.location) == String(location._id)
    });

    if (isLocationInUse) {
      useErrorMessage(new Error('Cannot delete a location that is being used by a contact. You must remove the location from the contact(s) first.'));
      return;
    }

    removeItemFromArrayById(_id, locations, setLocations)
  };

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

    console.log('customer on form load:', customer)

    reset(formValues) // Populates the form with loaded values

    setBusinessLocations(customer.businessLocations as BusinessLocationFormWithId[])
    setBillingLocations(customer.billingLocations as BillingLocationFormWithId[])
    setShippingLocations(customer.shippingLocations as ShippingLocationFormWithId[])
    setContacts(customer.contacts as unknown as ContactFormWithId[])
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

    console.log('customer on Form Submit:', customer)

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


  const hideBillingLocationForm = () => {
    setShowBillingLocationForm(false);
    setEditingBillingLocation(null);
  };
  const hideShippingLocationForm = () => {
    setShowShippingLocationForm(false);
    setEditingShippingLocation(null);
  };
  const hideBusinessLocationForm = () => {
    setShowBusinessLocationForm(false);
    setEditingBusinessLocation(null);
  };
  const hideContactForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

  const onBillingLocationFormSubmit = (formData: IAddressForm) => {
    if (editingBillingLocation) {
      const updatedLocations = billingLocations.map(loc => 
        loc._id === editingBillingLocation._id ? { ...formData, _id: loc._id } : loc
      );
      setBillingLocations(updatedLocations as BillingLocationFormWithId[]);
      setEditingBillingLocation(null);
    } else {
      setBillingLocations([...billingLocations, { ...formData, _id: generateMongooseId() }]);
    }
    hideBillingLocationForm();
  };

  const onShippingLocationFormSubmit = (formData: IShippingLocationForm) => {
    if (editingShippingLocation) {
      const updatedLocations = shippingLocations.map(loc => 
        loc._id === editingShippingLocation._id ? { ...formData, _id: loc._id } : loc
      );
      setShippingLocations(updatedLocations as ShippingLocationFormWithId[]);
      setEditingShippingLocation(null);
    } else {
      setShippingLocations([...shippingLocations, { ...formData, _id: generateMongooseId() }]);
    }
    hideShippingLocationForm();
  };

  const onBusinessLocationFormSubmit = (formData: BusinessLocationFormWithId) => {
    if (editingBusinessLocation) {
      const updatedLocations = businessLocations.map(loc => 
        loc._id === editingBusinessLocation._id ? { ...formData, _id: loc._id } : loc
      );
      setBusinessLocations(updatedLocations as BusinessLocationFormWithId[]);
      setEditingBusinessLocation(null);
    } else {
      setBusinessLocations([...businessLocations, { ...formData, _id: generateMongooseId() }]);
    }
    hideBusinessLocationForm();
  };

  const onContactFormSubmit = (formData: ContactFormWithId) => {
    if (editingContact) {
      const updatedContacts = contacts.map(contact => 
        contact._id === editingContact._id ? { ...formData, _id: contact._id } : contact
      );
      setContacts(updatedContacts as ContactFormWithId[]);
      setEditingContact(null);
    } else {
      setContacts([...contacts, { ...formData, _id: generateMongooseId() } as ContactFormWithId]);
    }
    hideContactForm();
  };

  const handleEditBillingLocation = (location: BillingLocationFormWithId) => {
    setEditingBillingLocation(location);
    setShowBillingLocationForm(true);
  };

  const handleEditShippingLocation = (location: ShippingLocationFormWithId) => {
    setEditingShippingLocation(location);
    setShowShippingLocationForm(true);
  };

  const handleEditBusinessLocation = (location: BusinessLocationFormWithId) => {
    setEditingBusinessLocation(location);
    setShowBusinessLocationForm(true);
  };

  const handleEditContact = (contact: ContactFormWithId) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

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
                <div className={formStyles.inputGroupWrapper}>
                  <TextArea
                    attribute='notes'
                    label="Notes"
                    isRequired={false}
                    placeholder='Enter notes here...'
                  />
                  <CustomSelect
                    attribute='creditTerms'
                    label="Credit Term"
                    options={creditTerms}
                    isRequired={false}
                    isMulti={true}
                  />
                </div>
                
                <DataTable
                  title="Business Locations"
                  columns={businessLocationColumns}
                  data={businessLocations}
                  onAdd={() => setShowBusinessLocationForm(true)}
                  renderRow={(row) => (
                    <DataTableRow
                      data={row}
                      columns={businessLocationColumns}
                      onEdit={() => handleEditBusinessLocation(row as BusinessLocationFormWithId)}
                      onDelete={() => handleLocationDelete(row._id, businessLocations, setBusinessLocations)}
                    />
                  )}
                />

                <DataTable
                  title="Shipping Locations"
                  columns={shippingLocationColumns}
                  data={shippingLocations}
                  onAdd={() => setShowShippingLocationForm(true)}
                  renderRow={(row) => (
                    <DataTableRow
                      data={row}
                      columns={shippingLocationColumns}
                      onEdit={() => handleEditShippingLocation(row as ShippingLocationFormWithId)}
                      onDelete={() => handleLocationDelete(row._id, shippingLocations, setShippingLocations)}
                    />
                  )}
                />

                <DataTable
                  title="Billing Locations"
                  columns={billingLocationColumns}
                  data={billingLocations}
                  onAdd={() => setShowBillingLocationForm(true)}
                  renderRow={(row) => (
                    <DataTableRow
                      data={row}
                      columns={billingLocationColumns}
                      onEdit={() => handleEditBillingLocation(row as BillingLocationFormWithId)}
                      onDelete={() => handleLocationDelete(row._id, billingLocations, setBillingLocations)}
                    />
                  )}
                />

                <DataTable
                  title="Contacts"
                  columns={contactColumns}
                  data={contacts}
                  onAdd={() => setShowContactForm(true)}
                  renderRow={(row) => (
                    <DataTableRow
                      data={row}
                      columns={contactColumns}
                      onEdit={() => handleEditContact(row as ContactFormWithId)}
                      onDelete={() => removeItemFromArrayById(row._id, contacts, setContacts)}
                    />
                  )}
                />

                <div className={formStyles.spacer}></div>

                <Button color="blue" size="large">
                  {isUpdateRequest ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
        <FormModal
          Form={AddressForm}
          isOpen={showBusinessLocationForm}
          onSubmit={onBusinessLocationFormSubmit}
          onCancel={hideBusinessLocationForm}
          title={editingBusinessLocation ? "Edit Business Location" : "Add Business Location"}
          initialData={editingBusinessLocation}
        />
        <FormModal
          Form={ShippingLocationForm}
          isOpen={showShippingLocationForm}
          onSubmit={onShippingLocationFormSubmit}
          onCancel={hideShippingLocationForm}
          title={editingShippingLocation ? "Edit Shipping Location" : "Add Shipping Location"}
          initialData={editingShippingLocation}
        />
        <FormModal
          Form={AddressForm}
          isOpen={showBillingLocationForm}
          onSubmit={onBillingLocationFormSubmit}
          onCancel={hideBillingLocationForm}
          title={editingBillingLocation ? "Edit Billing Location" : "Add Billing Location"}
          initialData={editingBillingLocation}
        />
        <FormModal
          Form={ContactForm}
          isOpen={showContactForm}
          onSubmit={onContactFormSubmit}
          onCancel={hideContactForm}
          title={editingContact ? "Edit Contact" : "Add Contact"}
          initialData={editingContact}
          locations={locations}
        />
      </div>
    </div>
  );
}

const removeItemFromArrayById = (_id: string, array: any[], setArray: (array: any[]) => void) => {
  const updatedArray = array.filter(item => item._id !== _id);
  setArray(updatedArray);
}

export default CustomerForm;
