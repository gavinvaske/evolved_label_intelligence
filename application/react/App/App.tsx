import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER, ADMIN } from '../../api/enums/authRolesEnum'
import { DropdownProvider, useDropdownContext } from '../_context/dropdownProvider';
import { lazy, Suspense } from "react";
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

const queryClient = new QueryClient();
const ANY_ROLE = [USER, ADMIN];

// Lazy loading components
const Login = lazy(() => import('../_auth/Login/Login'));
const Register = lazy(() => import('../_auth/Register/Register'));
const ForgotPassword = lazy(() => import('../_auth/ForgotPassword/ForgotPassword'));
const ChangePassword = lazy(() => import('../_auth/ChangePassword/ChangePassword'));
const Unauthorized = lazy(() => import('../_auth/Unauthorized/Unauthorized'));
const PageNotFound = lazy(() => import('../404/404'));

const ProtectedRoute = lazy(() => import('../_auth/ProtectedRoute/ProtectedRoute'));
const TopNavbarLayout = lazy(() => import('../_layouts/TopNavbarLayout'));
const AdminPanel = lazy(() => import('../AdminPanel/AdminPanel'));
const UserTable = lazy(() => import('../User/UserTable/UserTable'));
const UserAuthRolesForm = lazy(() => import('../User/UserAuthRolesForm/UserAuthRolesForm'));
const Inventory = lazy(() => import('../Inventory/Inventory'));
const Profile = lazy(() => import('../User/Profile/Profile'));
const CrudNavigation = lazy(() => import('../CrudNavigation/CrudNavigation'));

const ViewCustomer = lazy(() => import('../Customer/ViewCustomer/ViewCustomer'));

const VendorForm = lazy(() => import('../Vendor/VendorForm/VendorForm'));
const MaterialCategoryForm = lazy(() => import('../MaterialCategory/MaterialCategoryForm/MaterialCategoryForm'));
const MaterialLengthAdjustmentForm = lazy(() => import('../MaterialLengthAdjustment/MaterialLengthAdjustmentForm/MaterialLengthAdjustmentForm'));
const DeliveryMethodForm = lazy(() => import('../DeliveryMethod/DeliveryMethodForm/DeliveryMethodForm'));
const CreditTermForm = lazy(() => import('../CreditTerm/CreditTermForm/CreditTermForm'));
const QuoteForm = lazy(() => import('../Quote/QuoteForm/QuoteForm'));
const CustomerForm = lazy(() => import('../Customer/CustomerForm/CustomerForm'));
const LinerTypeForm = lazy(() => import('../LinerType/LinerTypeForm/LinerTypeForm'));
const MaterialForm = lazy(() => import('../Material/MaterialForm/MaterialForm'));
const AdhesiveCategoryForm = lazy(() => import('../AdhesiveCategory/AdhesiveCategoryForm/AdhesiveCategoryForm'));
const MaterialOrderForm = lazy(() => import('../MaterialOrder/MaterialOrderForm/MaterialOrderForm'));
const ProductForm = lazy(() => import('../Product/ProductForm/ProductForm'));
const DieForm = lazy(() => import('../Die/DieForm/DieForm'));

const VendorTable = lazy(() => import('../Vendor/VendorTable/VendorTable'));
const MaterialLengthAdjustmentTable = lazy(() => import('../MaterialLengthAdjustment/MaterialLengthAdjustmentTable/MaterialLengthAdjustmentTable/MaterialLengthAdjustmentTable'));
const QuoteTable = lazy(() => import('../Quote/QuoteTable/QuoteTable'));
const CreditTermTable = lazy(() => import('../CreditTerm/CreditTermTable/CreditTermTable'));
const DeliveryMethodTable = lazy(() => import('../DeliveryMethod/DeliveryMethodTable/DeliveryMethodTable'));
const LinerTypeTable = lazy(() => import('../LinerType/LinerTypeTable/LinerTypeTable'));
const MaterialCategoryTable = lazy(() => import('../MaterialCategory/MaterialCategoryTable/MaterialCategoryTable'));
const MaterialTable = lazy(() => import('../Material/MaterialTable/MaterialTable'));
const AdhesiveCategoryTable = lazy(() => import('../AdhesiveCategory/AdhesiveCategoryTable/AdhesiveCategoryTable'));
const CustomerTable = lazy(() => import('../Customer/CustomerTable/CustomerTable'));
const MaterialOrderTable = lazy(() => import('../MaterialOrder/MaterialOrderTable/MaterialOrderTable'));
const ProductTable = lazy(() => import('../Product/ProductTable/ProductTable'));
const DieTable = lazy(() => import('../Die/DieTable/DieTable'));

export function App() {
  return (
    <ErrorBoundary>
      <DropdownProvider>
        <QueryClientProvider client={queryClient}>
          <AppContainer>
            <Suspense fallback={<div>Loading...</div>}>
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
                        <Route path="liner-type/:mongooseId?" element={<LinerTypeForm />} />
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
            </Suspense>
          </AppContainer>
        </QueryClientProvider>
      </DropdownProvider>
    </ErrorBoundary>
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