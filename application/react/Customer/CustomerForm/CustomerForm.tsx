import { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm } from 'react-hook-form';
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
import * as tableStyles from '@ui/styles/table.module.scss';
import * as styles from './CustomerForm.module.scss';
import { MongooseId } from '@shared/types/typeAliases';
import clsx from 'clsx';

const customerTableUrl = '/react-ui/tables/customer'

export const CustomerForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ICustomerForm>();
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
      creditTerms: customer.creditTerms as MongooseId[]
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
          <form onSubmit={handleSubmit(onCustomerFormSubmit)} data-test='customer-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='customerId'
                  label="Customer ID"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='name'
                  label="Name"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
                <Input
                  attribute='overun'
                  label="Overun"
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
              <CustomSelect
                attribute='creditTerms'
                label="Credit Term"
                options={creditTerms}
                register={register}
                isRequired={false}
                errors={errors}
                control={control}
              />
            <div className={styles.titleHeader}>
              <h3>Business Locations:</h3>
            </div>
            <div className={clsx(styles.businessLocationCards, tableStyles.tblPri)}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}>Name</div>
                <div className={tableStyles.tblCell}>Address</div>
                <div className={tableStyles.tblCell}>Unit #</div>
                <div className={tableStyles.tblCell}>City</div>
                <div className={tableStyles.tblCell}>State</div>
                <div className={tableStyles.tblCell}>Zip</div>
                <div className={tableStyles.tblCell}>Delete</div>
              </div>
              <div className='table'>
                {
                  businessLocations.map((businessLocation, index) => {
                    return (
                      <div className={styles.tableRow} key={index}>
                        <AddressListItem
                          data={businessLocation}
                          onDelete={() => removeElementFromArray(index, businessLocations, setBusinessLocations)}
                        />
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <button className={styles.addNewRow} type="button" onClick={() => setShowBusinessLocationForm(true)}><i className="fa-solid fa-plus"></i> Add Business Location</button>

            <div className={styles.titleHeader}>
              <h3>Shipping Locations:</h3>
            </div>
            <div className={clsx(styles.shippingLocationCards, tableStyles.tblPri)}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}>Freight Acct #:</div>
                <div className={tableStyles.tblCell}>Delivery Method</div>
                <div className={tableStyles.tblCell}>Name</div>
                <div className={tableStyles.tblCell}>Street</div>
                <div className={tableStyles.tblCell}>Unit</div>
                <div className={tableStyles.tblCell}>City</div>
                <div className={tableStyles.tblCell}>State</div>
                <div className={tableStyles.tblCell}>Zip</div>
                <div className={tableStyles.tblCell}>Delete</div>
              </div>
              <div className='table'>
                {
                  shippingLocations.map((shippingLocation, index) => {
                    return (
                      <div key={index}>
                        <ShippingLocationCard
                          data={shippingLocation}
                          onDelete={() => removeElementFromArray(index, shippingLocations, setShippingLocations)}
                        />
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <button className={styles.addNewRow} type="button" onClick={() => setShowShippingLocationForm(true)}><i className="fa-solid fa-plus"></i>Add Shipping Location</button>

            <div className={styles.titleHeader}>
              <h3>Billing Locations:</h3>
            </div>
            <div className={clsx(styles.billingLocationCards, tableStyles.tblPri)}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}>Name</div>
                <div className={tableStyles.tblCell}>Street</div>
                <div className={tableStyles.tblCell}>Unit</div>
                <div className={tableStyles.tblCell}>City</div>
                <div className={tableStyles.tblCell}>State</div>
                <div className={tableStyles.tblCell}>Zip</div>
                <div className={tableStyles.tblCell}>Delete</div>
              </div>
              <div className='table'>
                {
                  billingLocations.map((billingLocation, index) => {
                    return (
                      <div key={index}>
                        <AddressListItem
                          data={billingLocation}
                          onDelete={() => removeElementFromArray(index, billingLocations, setBillingLocations)}
                        />
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <button className={styles.addNewRow} type="button" onClick={() => setShowBillingLocationForm(true)}><i className="fa-solid fa-plus"></i> Add Billing Location</button>

            <div className={styles.titleHeader}>
              <h3>Contacts:</h3>
            </div>
            <div className={clsx(styles.contactCards, tableStyles.tblPri)}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}>Name</div>
                <div className={tableStyles.tblCell}>Freight Number</div>
                <div className={tableStyles.tblCell}>Delivery Method</div>
                <div className={tableStyles.tblCell}>Street</div>
                <div className={tableStyles.tblCell}>Unit</div>
                <div className={tableStyles.tblCell}>City</div>
                <div className={tableStyles.tblCell}>State</div>
                <div className={tableStyles.tblCell}>Zip</div>
                <div className={tableStyles.tblCell}>Delete</div>
              </div>
              <div className='table'>
                {
                  contacts.map((contact, index) => {
                    return (
                      <div key={index}>
                        <ContactCard
                          data={contact}
                          onDelete={() => removeElementFromArray(index, contacts, setContacts)}
                        />
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <button className={styles.addNewRow} type="button" onClick={() => setShowContactForm(true)}><i className="fa-solid fa-plus"></i> Add Contact</button>
            {/* Let user know some form inputs had errors */}
            <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

            <button className={sharedStyles.submitButton} type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
        {/* Code Below Renders a modal IFF user initiated one to open */}
        {
          showBillingLocationForm &&
          <FormModal
            Form={AddressForm}
            onSubmit={onBillingLocationFormSubmit}
            onCancel={hideBillingLocationForm}
          />
        }
        {
          showShippingLocationForm &&
          <FormModal
            Form={ShippingLocationForm}
            onSubmit={onShippingLocationFormSubmit}
            onCancel={hideShippingLocationForm}
          />
        }
        {
          showBusinessLocationForm &&
          <FormModal
            Form={AddressForm}
            onSubmit={onBusinessLocationFormSubmit}
            onCancel={hideBusinessLocationForm}
          />
        }
        {
          showContactForm &&
          <FormModal
            Form={ContactForm}
            onSubmit={onContactFormSubmit}
            onCancel={hideContactForm}
            locations={locations}
          />
        }
      </div>
    </div>
  );
}

export default CustomerForm;