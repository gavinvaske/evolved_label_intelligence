import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOneCustomer } from '../../_queries/customer';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { ICustomer, ICreditTerm } from '@shared/types/models.ts';
import { IShippingLocation } from '@shared/types/schemas.ts';
import { IAddress } from '@shared/types/schemas.ts';
import { IContact } from '@shared/types/schemas.ts';

export const ViewCustomer = () => {
  const { mongooseId }= useParams();

  const { isError, data: customer, error } = useQuery<ICustomer>({
    queryKey: ['get-customer', mongooseId],
    queryFn: () => getOneCustomer(mongooseId as string),
    initialData: {} as ICustomer
  })

  if (isError) {
    useErrorMessage(error)
  }

  return (
    <div>
      <p>Created: {customer.createdAt}</p>
      <p>Last Modified: {customer.updatedAt}</p>
      <p>Customer ID: {customer.customerId}</p>
      <p>Name: {customer.name}</p>
      <p>Notes: {customer.notes}</p>
      <p>Overun: {customer.overun}</p>
      
      <h3>Business Locations:</h3>
      {customer.businessLocations?.map((location: IAddress) => (<Address location={location}/>))}
      <br></br>

      <h3>Shipping Locations:</h3>
      {customer.shippingLocations?.map((shippingLocation: IShippingLocation) => (<ShippingLocation shippingLocation={shippingLocation} />))}
      <br></br>

      <h3>Billing Locations:</h3>
      {customer.billingLocations?.map((billingLocation: IAddress) => (<Address location={billingLocation} />))}
      <br></br>

      <h3>Contacts: </h3>
      {customer.contacts?.map((contact) => (<Contact contact={contact} />))}
      <br></br>

      <h3>Credit Terms:</h3>
      {(customer.creditTerms as ICreditTerm[])?.map((creditTerm) => (<CreditTerm creditTerm={creditTerm}/>))}
      <br></br>
    </div>
  )
}

type CreditTermProps = {
  creditTerm: ICreditTerm
}

const CreditTerm = (props: CreditTermProps) => {
  const { creditTerm } = props;
  return (
    <div>
      <p>Description: {creditTerm.description}</p>
    </div>
  )
}

type ContactProps = {
  contact: IContact
}

const Contact = (props: ContactProps) => {
  const { contact } = props;

  return (
    <div>
      <p>Full Name: {contact.fullName}</p>
      <p>Phone Number: {contact.phoneNumber}</p>
      <p>Phone Extension: {contact.phoneExtension}</p>
      <p>Email: {contact.email}</p>
      <p>Contact Status: {contact.contactStatus}</p>
      <p>Notes: {contact.notes}</p>
      <p>Position: {contact.position}</p>
      {contact.location && <Address location={contact.location} />}
    </div>
  )
}

type AddressProps = {
  location: IAddress
}

const Address = (props: AddressProps) => {
  const { location } = props;

  return (
    <div>
      <p>Name: {location.name}</p>
      <p>Street: {location.street}</p>
      <p>Unit / Suite: {location.unitOrSuite}</p>
      <p>City: {location.city}</p>
      <p>State: {location.state}</p>
      <p>Zip Code: {location.zipCode}</p>
    </div>
  )
}

type ShippingLocationProps = {
  shippingLocation: IShippingLocation
}

const ShippingLocation = (props: ShippingLocationProps) => {
  const { shippingLocation } = props;

  return (
    <div>
      <p>Freight Account Number: {shippingLocation.freightAccountNumber}</p>
      <p>Delivery Method: {shippingLocation.deliveryMethod as unknown as string}</p>
      <p>Name: {shippingLocation.name}</p>
      <p>Street: {shippingLocation.street}</p>
      <p>Unit or Suite: {shippingLocation.unitOrSuite}</p>
      <p>City: {shippingLocation.city}</p>
      <p>State: {shippingLocation.state}</p>
      <p>Zip Code: {shippingLocation.zipCode}</p>
    </div>
  )
}

export default ViewCustomer;