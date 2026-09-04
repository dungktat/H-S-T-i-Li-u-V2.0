/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Windows12Desktop } from './components/modules/Windows12Shell/Windows12Desktop';
import { LoginPage } from './components/auth/LoginPage';
import { StorageService } from './services/storageService';
import { UserProfile, BrandConfig } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [branding, setBranding] = useState<BrandConfig>(() => StorageService.getBrandConfig());

  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'auth') {
        setIsAuthenticated(StorageService.isAuthenticated());
      }
      if (e?.detail?.type === 'user' || e?.detail?.type === 'users' || e?.detail?.type === 'all_reset') {
        setCurrentUser(StorageService.getCurrentUser());
      }
      if (e?.detail?.type === 'brand' || e?.detail?.type === 'all_reset') {
        setBranding(StorageService.getBrandConfig());
      }
    };

    window.addEventListener('hstl_state_change', handleStateChange);
    window.addEventListener('storage', handleStateChange);
    return () => {
      window.removeEventListener('hstl_state_change', handleStateChange);
      window.removeEventListener('storage', handleStateChange);
    };
  }, []);

  const handleLogin = (user: UserProfile) => {
    StorageService.login(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    StorageService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        branding={branding} 
        onLogin={handleLogin} 
        onUpdateBranding={(newBrand) => setBranding(newBrand)}
      />
    );
  }

  return <Windows12Desktop onLogout={handleLogout} />;
}

