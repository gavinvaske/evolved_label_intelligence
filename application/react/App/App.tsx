import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import QuoteForm from '../Quote/QuoteForm/QuoteForm';
import { CustomerForm } from '../Customer/CustomerForm/CustomerForm';
import { DeliveryMethodForm } from '../DeliveryMethod/DeliveryMethodForm/DeliveryMethodForm'
import { CreditTermForm } from '../CreditTerm/CreditTermForm/CreditTermForm';
import { CreditTermTable } from '../CreditTerm/CreditTermTable/CreditTermTable';
import DeliveryMethodTable from '../DeliveryMethod/DeliveryMethodTable/DeliveryMethodTable';
import Inventory from '../Inventory/Inventory';
import { LinerTypeForm } from '../LinerType/LinerTypeForm/LinerTypeForm';
import { LinerTypeTable } from '../LinerType/LinerTypeTable/LinerTypeTable';
import { MaterialForm } from '../Material/MaterialForm/MaterialForm';
import { AdhesiveCategoryForm } from '../AdhesiveCategory/AdhesiveCategoryForm/AdhesiveCategoryForm';
import { MaterialTable } from '../Material/MaterialTable/MaterialTable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopNavbarLayout } from '../_layouts/TopNavbarLayout';
import { PageNotFound } from '../404/404';
import { MaterialLengthAdjustmentForm } from '../MaterialLengthAdjustment/MaterialLengthAdjustmentForm/MaterialLengthAdjustmentForm';
import { AdhesiveCategoryTable } from '../AdhesiveCategory/AdhesiveCategoryTable/AdhesiveCategoryTable';
import { CustomerTable } from '../Customer/CustomerTable/CustomerTable';
import { MaterialOrderForm } from '../MaterialOrder/MaterialOrderForm/MaterialOrderForm';
import { MaterialOrderTable } from '../MaterialOrder/MaterialOrderTable/MaterialOrderTable';
import { ProtectedRoute } from '../_auth/ProtectedRoute/ProtectedRoute';
import { Login } from '../_auth/Login/Login';
import { USER, ADMIN } from '../../api/enums/authRolesEnum'
import { ForgotPassword } from '../_auth/ForgotPassword/ForgotPassword';
import { ChangePassword } from '../_auth/ChangePassword/ChangePassword';
import { Register } from '../_auth/Register/Register';
import { Unauthorized } from '../_auth/Unauthorized/Unauthorized';
import { Profile } from '../User/Profile/Profile';
import { CrudNavigation } from '../CrudNavigation/CrudNavigation';
import { ProductForm } from '../Product/ProductForm/ProductForm';
import { ProductTable } from '../Product/ProductTable/ProductTable';
import { DieTable } from '../Die/DieTable/DieTable';
import { DieForm } from '../Die/DieForm/DieForm';
import { ViewCustomer } from '../Customer/ViewCustomer/ViewCustomer';
import { QuoteTable } from '../Quote/QuoteTable/QuoteTable';
import { DropdownProvider, useDropdownContext } from '../_context/dropdownProvider';
import { MaterialLengthAdjustmentTable } from '../MaterialLengthAdjustment/MaterialLengthAdjustmentTable/MaterialLengthAdjustmentTable/MaterialLengthAdjustmentTable';
import { VendorForm } from '../Vendor/VendorForm/VendorForm';
import { VendorTable } from '../Vendor/VendorTable/VendorTable';
import { MaterialCategoryTable } from '../MaterialCategory/MaterialCategoryTable/MaterialCategoryTable';
import { MaterialCategoryForm } from '../MaterialCategory/MaterialCategoryForm/MaterialCategoryForm';
import { AdminPanel } from '../AdminPanel/AdminPanel';
import { UserTable } from '../User/UserTable/UserTable';
import { UserAuthRolesForm } from '../User/UserAuthRolesForm/UserAuthRolesForm';

const queryClient = new QueryClient();
const ANY_ROLE = [USER, ADMIN];

export function App() {
  return (
    <DropdownProvider>
      <QueryClientProvider client={queryClient}>
        <AppContainer>
          <Routes >
            <Route path='react-ui'>

              {/* PUBLIC ROUTES*/}
              <Route path='login' element={<Login />}></Route>
              <Route path='register' element={<Register />}></Route>

              <Route path='forgot-password' element={<ForgotPassword />}></Route>
              <Route path='change-password/:mongooseId/:token' element={<ChangePassword />} />
              <Route path='unauthorized' element={<Unauthorized />} />
              <Route path='*' element={<PageNotFound />} />

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={[ADMIN]} />}>
                <Route path='admin' element={<AdminPanel />}></Route>
                <Route path='tables/user' element={<UserTable />} />
                <Route path='forms/user/auth-roles/:mongooseId' element={<UserAuthRolesForm />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={ANY_ROLE} />}>
                <Route element={<TopNavbarLayout />}>
                  <Route path='inventory' element={<Inventory />}></Route>
                  <Route path='profile' element={<Profile />} />
                  <Route path='crud-navigation' element={<CrudNavigation />} />

                  <Route path='views'>
                    <Route path='customer/:mongooseId' element={<ViewCustomer />} />
                  </Route>

                  <Route path='forms'>
                    <Route path='vendor/:mongooseId?' element={<VendorForm />} />
                    <Route path='material-category/:mongooseId?' element={<MaterialCategoryForm />} />
                    <Route path='material-length-adjustment/:mongooseId?' element={<MaterialLengthAdjustmentForm />} />
                    <Route path='delivery-method/:mongooseId?' element={<DeliveryMethodForm />} />
                    <Route path='credit-term/:mongooseId?' element={<CreditTermForm />} />
                    <Route path='quote' element={<QuoteForm />} />
                    <Route path='customer/:mongooseId?' element={<CustomerForm />} />
                    <Route path="liner-type/:mongooseId?" element={<LinerTypeForm />} /> {/* TODO (6-5-2024): Enforce admin routes only render for admins */}
                    <Route path='material/:mongooseId?' element={<MaterialForm />} />
                    <Route path='adhesive-category/:mongooseId?' element={<AdhesiveCategoryForm />} />
                    <Route path='material-order/:mongooseId?' element={<MaterialOrderForm />} />
                    <Route path='product/:mongooseId?' element={<ProductForm />} />
                    <Route path='die/:mongooseId?' element={<DieForm />} />
                  </Route>

                  <Route path='tables'>
                    <Route path='vendor' element={<VendorTable />} />
                    <Route path='material-length-adjustment' element={<MaterialLengthAdjustmentTable />} />
                    <Route path='quote' element={<QuoteTable />} />
                    <Route path='credit-term' element={<CreditTermTable />} />
                    <Route path='delivery-method' element={<DeliveryMethodTable />} />
                    <Route path='liner-type' element={<LinerTypeTable />} />
                    <Route path='material-category' element={<MaterialCategoryTable />} />
                    <Route path='material' element={<MaterialTable />} />
                    <Route path='adhesive-category' element={<AdhesiveCategoryTable />} />
                    <Route path='customer' element={<CustomerTable />} />
                    <Route path='material-order' element={<MaterialOrderTable />} />
                    <Route path='product' element={<ProductTable />} />
                    <Route path='die' element={<DieTable />} />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Routes>
        </AppContainer>
      </QueryClientProvider>
    </DropdownProvider>
  )
}

const AppContainer = ({ children }) => {
  const context = useDropdownContext();

  if (!context) throw new Error('useDropdownContext must be used within the correct Provider');

  const { closeDropdownsIfClickWasOutside } = context;

  useEffect(() => {
    document.addEventListener('mousedown', closeDropdownsIfClickWasOutside);
    return () => {
      document.removeEventListener('mousedown', closeDropdownsIfClickWasOutside);
    };
  })

  return (
    <>
      {children}
    </>
  );
}