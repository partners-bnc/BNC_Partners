import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Sidebar from '../Component/Sidebar';
import { fetchAdminDashboardData, logout } from '../lib/supabaseData';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const statMargin = isRtl ? 'mr-4' : 'ml-4';
  const textAlign = isRtl ? 'text-right' : 'text-left';

  const fetchAdminData = async () => {
    try {
      const data = await fetchAdminDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const admin = JSON.parse(userData);
      setAdminData(admin);
      fetchAdminData().then(() => setLoading(false));
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchAdminData, 30000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('adminUser');
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('adminDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex ${isRtl ? 'flex-row-reverse' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          adminData={adminData} 
          onLogout={handleLogout} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className={`flex items-center ${rowDirection}`}>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className={statMargin}>
                <p className="font-geist text-sm font-medium text-gray-600">{t('adminDashboard.kpis.totalPartners')}</p>
                <p className="font-poppins text-2xl font-bold text-gray-900">{dashboardData?.kpis?.totalPartners || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className={`flex items-center ${rowDirection}`}>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className={statMargin}>
                <p className="font-geist text-sm font-medium text-gray-600">{t('adminDashboard.kpis.activePartners')}</p>
                <p className="font-poppins text-2xl font-bold text-gray-900">{dashboardData?.kpis?.activePartners || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className={`flex items-center ${rowDirection}`}>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className={statMargin}>
                <p className="font-geist text-sm font-medium text-gray-600">{t('adminDashboard.kpis.pending')}</p>
                <p className="font-poppins text-2xl font-bold text-gray-900">{dashboardData?.kpis?.pendingPartners || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className={`flex items-center ${rowDirection}`}>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className={statMargin}>
                <p className="font-geist text-sm font-medium text-gray-600">{t('adminDashboard.kpis.thisMonth')}</p>
                <p className="font-poppins text-2xl font-bold text-gray-900">{dashboardData?.kpis?.thisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-poppins text-lg font-semibold text-gray-900">{t('adminDashboard.table.title')}</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.name')}
                  </th>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.email')}
                  </th>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.phone')}
                  </th>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.country')}
                  </th>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.city')}
                  </th>
                  <th className={`font-geist px-6 py-3 ${textAlign} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t('adminDashboard.table.columns.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.partners?.map((partner, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="font-geist px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {partner.name}
                    </td>
                    <td className="font-geist px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.email}
                    </td>
                    <td className="font-geist px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.phone}
                    </td>
                    <td className="font-geist px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.country}
                    </td>
                    <td className="font-geist px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-geist inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        partner.status === 'Complete'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {partner.status === 'Complete'
                          ? t('adminDashboard.status.complete')
                          : partner.status === 'Pending'
                            ? t('adminDashboard.status.pending')
                            : partner.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;



