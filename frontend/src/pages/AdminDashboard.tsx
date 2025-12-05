import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Diamond, MessageCircle, TrendingUp, Eye, Calendar, DollarSign, FileCheck as CheckCircle, Circle as XCircle, Clock, FileText, Download, Shield, AlertCircle, Trash2, Search, ListFilter as Filter, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface DashboardStats {
  totalUsers: number;
  totalDiamonds: number;
  totalContacts: number;
  totalVerifications: number;
  pendingVerifications: number;
  totalValue: number;
  averagePrice: number;
  recentUsers: any[];
  recentDiamonds: any[];
  recentContacts: any[];
  recentVerifications: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Diamond {
  _id: string;
  name: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  price: number;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Verification {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  aadhaarNumber: string;
  documentType: string;
  documentNumber: string;
  documentPath: string;
  status: string;
  submittedAt: string;
  rejectionReason?: string;
}

interface DiamondSale {
  _id: string;
  diamond: {
    _id: string;
    name: string;
    carat: number;
    cut: string;
    color: string;
    clarity: string;
    price: number;
    image: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  invoiceNumber: string;
  paymentAmount: number;
  invoiceDocument: string;
  paymentProof: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documentsViewed?: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { admin, token } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [diamondSales, setDiamondSales] = useState<DiamondSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<DiamondSale | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (admin && token) {
      fetchDashboardData();
    }
  }, [admin, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchDiamonds(),
        fetchContacts(),
        fetchVerifications(),
        fetchDiamondSales()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDiamonds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/diamonds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDiamonds(data.diamonds);
      }
    } catch (error) {
      console.error('Error fetching diamonds:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/verifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setVerifications(data.verifications);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const fetchDiamondSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDiamondSales(data.sales);
      }
    } catch (error) {
      console.error('Error fetching diamond sales:', error);
    }
  };

  const handleVerificationReview = async (verificationId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/verifications/${verificationId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      const data = await response.json();
      if (data.success) {
        await fetchVerifications();
        await fetchUsers(); // Refresh users to show updated verification status
        setShowVerificationModal(false);
        setSelectedVerification(null);
      }
    } catch (error) {
      console.error('Error reviewing verification:', error);
    }
  };

  const handleSaleVerification = async (saleId: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/sales/${saleId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      const data = await response.json();
      if (data.success) {
        await fetchDiamondSales();
        await fetchDiamonds(); // Refresh diamonds to show updated status
        setShowSaleModal(false);
        setSelectedSale(null);
      }
    } catch (error) {
      console.error('Error verifying sale:', error);
    }
  };

  const markSaleDocumentsViewed = async (saleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/sales/${saleId}/mark-viewed`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchDiamondSales();
        // Update the selected sale to reflect the change
        if (selectedSale && selectedSale._id === saleId) {
          setSelectedSale({
            ...selectedSale,
            documentsViewed: true,
            invoiceDocument: 'DELETED',
            paymentProof: 'DELETED'
          });
        }
      }
    } catch (error) {
      console.error('Error marking documents as viewed:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login as admin to access this dashboard</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {admin.name}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'diamonds', label: 'Diamonds', icon: Diamond },
                { id: 'verifications', label: 'Verifications', icon: Shield },
                { id: 'sales', label: 'Diamond Sales', icon: FileText },
                { id: 'contacts', label: 'Contacts', icon: MessageCircle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {id === 'verifications' && verifications.filter(v => v.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {verifications.filter(v => v.status === 'pending').length}
                    </span>
                  )}
                  {id === 'sales' && diamondSales.filter(s => s.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {diamondSales.filter(s => s.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Total Diamonds</p>
                        <p className="text-2xl font-bold text-green-900">{stats.totalDiamonds}</p>
                      </div>
                      <Diamond className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-yellow-900">{formatPrice(stats.totalValue)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Pending Verifications</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.pendingVerifications}</p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
                    <div className="space-y-3">
                      {stats.recentVerifications.map((verification: any) => (
                        <div key={verification._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{verification.user.name}</p>
                            <p className="text-sm text-gray-500">{formatDate(verification.submittedAt)}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getVerificationStatusColor(verification.status)}`}>
                            {verification.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Recent Diamonds</h3>
                    <div className="space-y-3">
                      {stats.recentDiamonds.map((diamond: any) => (
                        <div key={diamond._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{diamond.name}</p>
                            <p className="text-sm text-gray-500">{diamond.seller.name}</p>
                          </div>
                          <p className="font-semibold">{formatPrice(diamond.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Not Verified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Diamonds Tab */}
            {activeTab === 'diamonds' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Diamonds Management</h2>
                  <button
                    onClick={fetchDiamonds}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {diamonds.map((diamond) => (
                        <tr key={diamond._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{diamond.name}</div>
                              <div className="text-sm text-gray-500">{diamond.carat}ct {diamond.cut}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{diamond.seller.name}</div>
                              <div className="text-sm text-gray-500">{diamond.seller.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(diamond.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              diamond.status === 'active' ? 'bg-green-100 text-green-800' :
                              diamond.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              diamond.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {diamond.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(diamond.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Verifications</h2>
                  <button
                    onClick={fetchVerifications}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {verifications.map((verification) => (
                        <tr key={verification._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{verification.user.name}</div>
                              <div className="text-sm text-gray-500">{verification.user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{verification.documentType.toUpperCase()}</div>
                              <div className="text-sm text-gray-500">XXXX XXXX {verification.aadhaarNumber.slice(-4)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(verification.status)}`}>
                              {verification.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(verification.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedVerification(verification);
                                  setShowVerificationModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Diamond Sales Tab */}
            {activeTab === 'sales' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Diamond Sales</h2>
                  <button
                    onClick={fetchDiamondSales}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {diamondSales.map((sale) => (
                        <tr key={sale._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={sale.diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                                alt={sale.diamond.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{sale.diamond.name}</div>
                                <div className="text-sm text-gray-500">{sale.diamond.carat}ct {sale.diamond.cut}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{sale.seller.name}</div>
                              <div className="text-sm text-gray-500">{sale.seller.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">Invoice: {sale.invoiceNumber}</div>
                              <div className="text-sm text-gray-500">Amount: {formatPrice(sale.paymentAmount)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              sale.status === 'verified' ? 'bg-green-100 text-green-800' :
                              sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowSaleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
                  <button
                    onClick={fetchContacts}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-500">{contact.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contact.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                              contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {contact.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contact.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Review Modal */}
        {showVerificationModal && selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review User Verification</h2>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Information</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Personal Details</h4>
                        <p className="text-sm text-gray-600">Name: {selectedVerification.user.name}</p>
                        <p className="text-sm text-gray-600">Email: {selectedVerification.user.email}</p>
                        {selectedVerification.user.phone && (
                          <p className="text-sm text-gray-600">Phone: {selectedVerification.user.phone}</p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Document Details</h4>
                        <p className="text-sm text-gray-600">Type: {selectedVerification.documentType.toUpperCase()}</p>
                        <p className="text-sm text-gray-600">Number: {selectedVerification.documentNumber}</p>
                        <p className="text-sm text-gray-600">Aadhaar: XXXX XXXX {selectedVerification.aadhaarNumber.slice(-4)}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                        <p className="text-sm text-gray-600">Submitted: {formatDate(selectedVerification.submittedAt)}</p>
                        <p className="text-sm text-gray-600">Status: 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getVerificationStatusColor(selectedVerification.status)}`}>
                            {selectedVerification.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Image */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Uploaded Document</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <img
                        src={selectedVerification.documentPath}
                        alt="Verification Document"
                        className="w-full h-auto rounded-lg border max-h-96 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Eb2N1bWVudCBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {selectedVerification.status === 'pending' && (
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => handleVerificationReview(selectedVerification._id, 'approved')}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Verification
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          handleVerificationReview(selectedVerification._id, 'rejected', reason);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Verification
                    </button>
                  </div>
                )}

                {selectedVerification.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{selectedVerification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sale Review Modal */}
        {showSaleModal && selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Diamond Sale</h2>
                  <button
                    onClick={() => setShowSaleModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sale Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sale Information</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{selectedSale.diamond.name}</h4>
                        <p className="text-sm text-gray-600">
                          {selectedSale.diamond.carat}ct {selectedSale.diamond.cut} - {selectedSale.diamond.color} {selectedSale.diamond.clarity}
                        </p>
                        <p className="text-sm text-gray-600">Listed Price: {formatPrice(selectedSale.diamond.price)}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Seller: {selectedSale.seller.name}</h4>
                        <p className="text-sm text-gray-600">{selectedSale.seller.email}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Sale Details</h4>
                        <p className="text-sm text-gray-600">Invoice: {selectedSale.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">Payment: {formatPrice(selectedSale.paymentAmount)}</p>
                        <p className="text-sm text-gray-600">Submitted: {formatDate(selectedSale.submittedAt)}</p>
                        <p className="text-sm text-gray-600">Status: 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            selectedSale.status === 'verified' ? 'bg-green-100 text-green-800' :
                            selectedSale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedSale.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Documents</h3>
                    {selectedSale.invoiceDocument !== 'DELETED' && selectedSale.paymentProof !== 'DELETED' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Invoice Document</h4>
                          <img
                            src={selectedSale.invoiceDocument}
                            alt="Invoice"
                            className="w-full h-64 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZvaWNlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Payment Proof</h4>
                          <img
                            src={selectedSale.paymentProof}
                            alt="Payment Proof"
                            className="w-full h-64 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXltZW50IFByb29mIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Documents have been viewed and deleted</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Invoice: {selectedSale.invoiceNumber} | Amount: {formatPrice(selectedSale.paymentAmount)}
                        </p>
                      </div>
                    )}

                    {selectedSale.invoiceDocument !== 'DELETED' && !selectedSale.documentsViewed && (
                      <div className="mt-4">
                        <button
                          onClick={() => markSaleDocumentsViewed(selectedSale._id)}
                          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Mark as Viewed & Delete Documents
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Documents will be permanently deleted after marking as viewed
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSale.status === 'pending' && (
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => handleSaleVerification(selectedSale._id, 'verified')}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Verify Sale
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          handleSaleVerification(selectedSale._id, 'rejected', reason);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Sale
                    </button>
                  </div>
                )}

                {selectedSale.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{selectedSale.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;