import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./Pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./Pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./Pages/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./Pages/landing/landing.module').then(m => m.LandingPageModule)
  },
  {
    path: 'get-started',
    loadChildren: () => import('./Pages/get-started/get-started.module').then(m => m.GetStartedPageModule)
  },
  {
    path: 'forget-password',
    loadChildren: () => import('./Pages/forget-password/forget-password.module').then( m => m.ForgetPasswordPageModule)
  },
  {
    path: 'account-details',
    loadChildren: () => import('./Pages/account-details/account-details.module').then( m => m.AccountDetailsPageModule)
  },
  {
    path: 'scan-qr',
    loadChildren: () => import('./Pages/scan-qr/scan-qr.module').then( m => m.ScanQRPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./Pages/wallet/wallet.module').then( m => m.WalletPageModule)
  },
  {
    path: 'payment-history',
    loadChildren: () => import('./Pages/payment-history/payment-history.module').then( m => m.PaymentHistoryPageModule)
  },

  
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
