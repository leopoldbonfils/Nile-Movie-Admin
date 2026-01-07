import React from 'react';
import { Menu, User } from 'lucide-react';
import authService from '../../services/authService';

const Header = ({ toggleSidebar }) => {
  const admin = authService.getCurrentAdmin();

  return (
    <header className="header">
      <button className="menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      <div className="header-right">
        <div className="admin-info">
          <User size={20} />
          <span>{admin?.fullName || admin?.email || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;