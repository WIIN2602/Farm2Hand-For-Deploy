import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Star, Package, TrendingUp, DollarSign, Users, Edit3, Save, X, Camera, Plus, Heart, UserPlus, ShoppingBag, Loader2, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { customerService, type CustomerData } from '../services/customerService';
import { productService, type Product } from '../services/productService';
import { SearchModal } from '../components/SearchModal';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { OrderHistoryModal } from '../components/OrderHistoryModal';
import { NotificationContainer } from '../components/NotificationPopup';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotification } from '../hooks/useNotification';

interface FarmerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  farmName: string;
  farmSize: string;
  joinDate: string;
  rating: number;
  totalSales: number;
  activeProducts: number;
  followers: number;
  bio: string;
  specialties: string[];
  certifications: string[];
  avatar: string;
  coverImage: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
  } = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'favorites' | 'following'>('favorites');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState<number | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    farmName: user?.farmName || '',
  });

  // Load customer data for customers
  useEffect(() => {
    if (user?.role === 'customer') {
      loadCustomerData();
    } else if (user?.role === 'farmer') {
      loadFarmerProducts();
    }
  }, [user]);

  const loadCustomerData = async () => {
    if (!user) return;
    
    setLoadingCustomerData(true);
    try {
      const data = await customerService.getCustomerData(user.id);
      setCustomerData(data);
    } catch (error) {
      console.error('Failed to load customer data:', error);
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลลูกค้าได้');
    } finally {
      setLoadingCustomerData(false);
    }
  };

  const loadFarmerProducts = async () => {
    if (!user || user.role !== 'farmer') return;
    
    setLoadingProducts(true);
    try {
      const products = await productService.getProductsByFarmer(user.id);
      setFarmerProducts(products);
    } catch (error) {
      console.error('Failed to load farmer products:', error);
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดสินค้าได้');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Mock profile data based on user role
  const mockFarmerProfile: FarmerProfile = {
    id: user?.id?.toString() || '1',
    name: user?.name || 'นายสมชาย ใจดี',
    email: user?.email || 'farmer@farm2hand.com',
    phone: user?.phone || '081-234-5678',
    location: user?.location || 'จ.เชียงใหม่, อ.แม่ริม',
    farmName: user?.farmName || 'สวนออร์แกนิคสมชาย',
    farmSize: '15 ไร่',
    joinDate: user?.createdAt?.toISOString() || '2023-01-15',
    rating: 4.8,
    totalSales: 125000,
    activeProducts: farmerProducts.length,
    followers: 234,
    bio: 'เกษตรกรรุ่นใหม่ที่มุ่งมั่นในการปลูกผักออร์แกนิคคุณภาพสูง ด้วยประสบการณ์กว่า 10 ปี ในการทำเกษตรแบบยั่งยืน',
    specialties: ['ผักใบเขียว', 'ผลไม้ตามฤดูกาล', 'สมุนไพร'],
    certifications: ['ออร์แกนิค', 'GAP', 'เกษตรปลอดภัย'],
    avatar: user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1200'
  };

  const profile = mockFarmerProfile;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({
      name: profile.name,
      phone: profile.phone,
      location: profile.location,
      farmName: profile.farmName,
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(editedProfile);
      setIsEditing(false);
      showSuccess('บันทึกสำเร็จ', 'ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้');
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      name: profile.name,
      phone: profile.phone,
      location: profile.location,
      farmName: profile.farmName,
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveFavorite = async (favoriteItem: string) => {
    if (!user) return;
    
    try {
      const updatedData = await customerService.removeFavorite(user.id, favoriteItem);
      setCustomerData(updatedData);
      showSuccess('ลบสำเร็จ', `ลบ "${favoriteItem}" จากรายการโปรดแล้ว`);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการโปรดได้');
    }
  };

  const handleUnfollowFarmer = async (farmerName: string) => {
    if (!user) return;
    
    try {
      const updatedData = await customerService.unfollowFarmer(user.id, farmerName);
      setCustomerData(updatedData);
      showSuccess('เลิกติดตามสำเร็จ', `เลิกติดตาม "${farmerName}" แล้ว`);
    } catch (error) {
      console.error('Failed to unfollow farmer:', error);
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถเลิกติดตามได้');
    }
  };

  const handleOpenSearch = (type: 'favorites' | 'following') => {
    setSearchType(type);
    setShowSearchModal(true);
  };

  const handleSearchModalUpdate = () => {
    loadCustomerData(); // Reload customer data when search modal updates
  };

  const handleProductAdded = () => {
    loadFarmerProducts(); // Reload farmer products when new product is added
    showSuccess('เพิ่มสินค้าสำเร็จ', 'สินค้าใหม่ได้รับการเพิ่มแล้ว');
  };

  const handleProductUpdated = () => {
    loadFarmerProducts(); // Reload farmer products when product is updated
    showSuccess('อัปเดตสำเร็จ', 'ข้อมูลสินค้าได้รับการอัปเดตแล้ว');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!user || user.role !== 'farmer') return;
    
    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบสินค้า',
      message: `คุณแน่ใจหรือไม่ที่จะลบสินค้า "${productName}"?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        setDeletingProduct(productId);
        try {
          await productService.deleteProduct(productId, user.id);
          
          // Remove product from local state immediately for better UX
          setFarmerProducts(prev => prev.filter(product => product.id !== productId));
          
          // Show success notification
          showSuccess('ลบสินค้าสำเร็จ', `ลบ "${productName}" เรียบร้อยแล้ว`);
        } catch (error) {
          console.error('Failed to delete product:', error);
          const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบสินค้า';
          showError('เกิดข้อผิดพลาด', errorMessage);
        } finally {
          setDeletingProduct(null);
        }
      }
    });
  };

  const handleToggleStock = async (productId: number) => {
    if (!user || user.role !== 'farmer') return;
    
    setUpdatingProduct(productId);
    try {
      await productService.toggleProductStock(productId, user.id);
      loadFarmerProducts(); // Reload products after update
      showSuccess('อัปเดตสำเร็จ', 'สถานะสินค้าได้รับการอัปเดตแล้ว');
    } catch (error) {
      console.error('Failed to update product stock:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า';
      showError('เกิดข้อผิดพลาด', errorMessage);
    } finally {
      setUpdatingProduct(null);
    }
  };

  // Simplified two-button system
  const getProductButtonInfo = (product: Product) => {
    const hasStock = product.stock > 0;
    const isAvailable = hasStock && product.inStock;

    if (isAvailable) {
      // Product is available for sale - show green "เปิดขาย" button
      return {
        text: 'เปิดขาย',
        color: 'bg-nature-green hover:bg-nature-dark-green text-white',
        canClick: true,
        statusColor: 'bg-nature-green/10 text-nature-green'
      };
    } else {
      // Product is not available - show red "หมด" button
      return {
        text: 'หมด',
        color: 'bg-red-500 hover:bg-red-600 text-white',
        canClick: hasStock, // Can only click if there's stock to reopen
        statusColor: 'bg-red-100 text-red-700'
      };
    }
  };

  const currentProfile = isEditing ? { ...profile, ...editedProfile } : profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-beige to-light-beige">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-nature-green to-nature-dark-green rounded-xl overflow-hidden mb-6 shadow-lg">
          <img
            src={currentProfile.coverImage}
            alt="Farm Cover"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-nature-dark-green rounded-lg transition-colors duration-200 shadow-md"
              >
                <Edit3 className="w-4 h-4" />
                <span className="font-medium">แก้ไขโปรไฟล์</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg transition-colors duration-200 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span className="font-medium">บันทึก</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-md"
                >
                  <X className="w-4 h-4" />
                  <span className="font-medium">ยกเลิก</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-nature-green hover:bg-nature-dark-green text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold text-nature-dark-green bg-transparent border-b-2 border-nature-green focus:outline-none focus:border-nature-dark-green"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-nature-dark-green">{currentProfile.name}</h1>
                )}
                
                {user?.role === 'farmer' && (
                  <>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.farmName}
                        onChange={(e) => handleInputChange('farmName', e.target.value)}
                        className="text-lg text-nature-green bg-transparent border-b border-nature-green/50 focus:outline-none focus:border-nature-green mt-1"
                      />
                    ) : (
                      <p className="text-lg text-nature-green font-medium">{currentProfile.farmName}</p>
                    )}
                  </>
                )}
              </div>

              {/* Quick Stats - Only show for farmers */}
              {user?.role === 'farmer' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-sun-yellow text-sun-yellow" />
                      <span className="font-bold text-nature-dark-green">{currentProfile.rating}</span>
                    </div>
                    <p className="text-xs text-cool-gray">คะแนน</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-nature-dark-green">฿{(currentProfile.totalSales / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-cool-gray">ยอดขาย</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-nature-dark-green">{currentProfile.activeProducts}</p>
                    <p className="text-xs text-cool-gray">สินค้า</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-nature-dark-green">{currentProfile.followers}</p>
                    <p className="text-xs text-cool-gray">ผู้ติดตาม</p>
                  </div>
                </div>
              )}

              {/* Customer Stats */}
              {user?.role === 'customer' && customerData && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      <span className="font-bold text-nature-dark-green">{customerData.favorites.length}</span>
                    </div>
                    <p className="text-xs text-cool-gray">รายการโปรด</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <UserPlus className="w-4 h-4 text-nature-green" />
                      <span className="font-bold text-nature-dark-green">{customerData.following.length}</span>
                    </div>
                    <p className="text-xs text-cool-gray">กำลังติดตาม</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-4 h-4 text-nature-brown" />
                      <span className="font-bold text-nature-dark-green text-xs">
                        {new Date(customerData.createdAt).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-cool-gray">เริ่มใช้งาน</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-cool-gray">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentProfile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{currentProfile.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{currentProfile.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>เข้าร่วมเมื่อ {new Date(currentProfile.joinDate).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio - Only show for farmers */}
            {user?.role === 'farmer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <h2 className="text-xl font-semibold text-nature-dark-green mb-4">เกี่ยวกับฟาร์ม</h2>
                <p className="text-nature-dark-green leading-relaxed">{currentProfile.bio}</p>
              </div>
            )}

            {/* Customer Favorites */}
            {user?.role === 'customer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-nature-dark-green">รายการโปรด</h2>
                  <button
                    onClick={() => handleOpenSearch('favorites')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Search className="w-4 h-4" />
                    <span className="font-medium">ค้นหาสินค้า</span>
                  </button>
                </div>
                
                {loadingCustomerData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                    <span className="ml-2 text-cool-gray">กำลังโหลด...</span>
                  </div>
                ) : customerData && customerData.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customerData.favorites.map((favorite, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-soft-beige/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          <span className="text-nature-dark-green font-medium">{favorite}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(favorite)}
                          className="text-cool-gray hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-cool-gray/30 mx-auto mb-3" />
                    <p className="text-cool-gray mb-2">ยังไม่มีรายการโปรด</p>
                    <p className="text-sm text-cool-gray/70 mb-4">เริ่มเลือกสินค้าที่คุณชอบเพื่อเพิ่มในรายการโปรด</p>
                    <button
                      onClick={() => handleOpenSearch('favorites')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                    >
                      <Search className="w-4 h-4" />
                      ค้นหาสินค้า
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Customer Following */}
            {user?.role === 'customer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-nature-dark-green">เกษตรกรที่ติดตาม</h2>
                  <button
                    onClick={() => handleOpenSearch('following')}
                    className="flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg transition-colors duration-200"
                  >
                    <Search className="w-4 h-4" />
                    <span className="font-medium">ค้นหาเกษตรกร</span>
                  </button>
                </div>
                
                {loadingCustomerData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                    <span className="ml-2 text-cool-gray">กำลังโหลด...</span>
                  </div>
                ) : customerData && customerData.following.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customerData.following.map((farmerName, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-nature-green/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-nature-green" />
                          <span className="text-nature-dark-green font-medium">{farmerName}</span>
                        </div>
                        <button
                          onClick={() => handleUnfollowFarmer(farmerName)}
                          className="text-cool-gray hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-cool-gray/30 mx-auto mb-3" />
                    <p className="text-cool-gray mb-2">ยังไม่ได้ติดตามเกษตรกรใดๆ</p>
                    <p className="text-sm text-cool-gray/70 mb-4">ค้นหาและติดตามเกษตรกรที่คุณสนใจ</p>
                    <button
                      onClick={() => handleOpenSearch('following')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg transition-colors duration-200"
                    >
                      <Search className="w-4 h-4" />
                      ค้นหาเกษตรกร
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Specialties and Certifications - Only show for farmers */}
            {user?.role === 'farmer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specialties */}
                  <div>
                    <h3 className="text-lg font-semibold text-nature-dark-green mb-3">ความเชี่ยวชาญ</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-nature-green/10 text-nature-dark-green rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-nature-dark-green mb-3">การรับรอง</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-sun-yellow/20 text-nature-dark-green rounded-full text-sm font-medium border border-sun-yellow/30"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products - Only show for farmers */}
            {user?.role === 'farmer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-nature-dark-green">สินค้าของฉัน</h2>
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">เพิ่มสินค้า</span>
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                    <span className="ml-2 text-cool-gray">กำลังโหลดสินค้า...</span>
                  </div>
                ) : farmerProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farmerProducts.map((product) => {
                      const buttonInfo = getProductButtonInfo(product);
                      const isUpdating = updatingProduct === product.id;
                      const isDeleting = deletingProduct === product.id;
                      
                      return (
                        <div key={product.id} className="border border-border-beige rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 object-cover"
                            />
                            
                            {/* Stock Status Overlay */}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded-full">
                                  หมด
                                </span>
                              </div>
                            )}
                            
                            {/* Organic Badge */}
                            {product.organic && (
                              <div className="absolute top-2 left-2">
                                <span className="text-xs px-2 py-1 bg-nature-green text-white rounded-full">
                                  ออร์แกนิค
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <h4 className="font-medium text-nature-dark-green mb-1 text-sm truncate">{product.name}</h4>
                            <p className="text-fresh-orange font-bold text-sm">฿{product.price}/{product.unit}</p>
                            <div className="flex justify-between text-xs text-cool-gray mt-2 mb-3">
                              <span>คงเหลือ: {product.stock}</span>
                              <span>รีวิว: {product.reviews}</span>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="mb-3">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${buttonInfo.statusColor}`}>
                                <span>{buttonInfo.text}</span>
                              </div>
                            </div>
                            
                            {/* Product Actions */}
                            <div className="flex gap-2">
                              {/* Main Status Button */}
                              <button
                                onClick={() => handleToggleStock(product.id)}
                                disabled={!buttonInfo.canClick || isUpdating || isDeleting}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
                                  !buttonInfo.canClick || isDeleting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : buttonInfo.color
                                }`}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  buttonInfo.text
                                )}
                              </button>
                              
                              {/* Edit Button */}
                              <button 
                                onClick={() => handleEditProduct(product)}
                                disabled={isDeleting}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                                  isDeleting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              
                              {/* Delete Button */}
                              <button 
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={isDeleting}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center ${
                                  isDeleting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-cool-gray/30 mx-auto mb-3" />
                    <p className="text-cool-gray mb-2">ยังไม่มีสินค้า</p>
                    <p className="text-sm text-cool-gray/70 mb-4">เริ่มเพิ่มสินค้าแรกของคุณ</p>
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มสินค้า
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
              <h3 className="text-lg font-semibold text-nature-dark-green mb-4">
                {user?.role === 'farmer' ? 'ข้อมูลฟาร์ม' : 'ข้อมูลผู้ใช้'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-cool-gray">ประเภทผู้ใช้</span>
                  <p className="font-medium text-nature-dark-green">
                    {user?.role === 'farmer' ? 'เกษตรกร' : 'ลูกค้า'}
                  </p>
                </div>
                
                {user?.role === 'farmer' && (
                  <div>
                    <span className="text-sm text-cool-gray">ขนาดฟาร์ม</span>
                    <p className="font-medium text-nature-dark-green">{profile.farmSize}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-cool-gray">สถานะการยืนยัน</span>
                  <p className={`font-medium ${user?.isVerified ? 'text-nature-green' : 'text-fresh-orange'}`}>
                    {user?.isVerified ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Stats - Only show for farmers */}
            {user?.role === 'farmer' && (
              <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
                <h3 className="text-lg font-semibold text-nature-dark-green mb-4">สถิติรายละเอียด</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-sun-yellow text-sun-yellow" />
                      <span className="text-cool-gray">คะแนนเฉลี่ย</span>
                    </div>
                    <span className="font-bold text-nature-dark-green">{currentProfile.rating}/5.0</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-fresh-orange" />
                      <span className="text-cool-gray">ยอดขายรวม</span>
                    </div>
                    <span className="font-bold text-nature-dark-green">฿{currentProfile.totalSales.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-nature-green" />
                      <span className="text-cool-gray">สินค้าที่ขาย</span>
                    </div>
                    <span className="font-bold text-nature-dark-green">{currentProfile.activeProducts}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-nature-brown" />
                      <span className="text-cool-gray">ผู้ติดตาม</span>
                    </div>
                    <span className="font-bold text-nature-dark-green">{currentProfile.followers}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-border-beige p-6">
              <h3 className="text-lg font-semibold text-nature-dark-green mb-4">การจัดการ</h3>
              
              <div className="space-y-3">
                {user?.role === 'farmer' ? (
                  <>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200">
                      <TrendingUp className="w-5 h-5 text-nature-green" />
                      <span className="text-nature-dark-green">ดูสถิติการขาย</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowAddProductModal(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200"
                    >
                      <Package className="w-5 h-5 text-fresh-orange" />
                      <span className="text-nature-dark-green">เพิ่มสินค้าใหม่</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200">
                      <Users className="w-5 h-5 text-nature-brown" />
                      <span className="text-nature-dark-green">ดูผู้ติดตาม</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowOrderHistoryModal(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200"
                    >
                      <ShoppingBag className="w-5 h-5 text-fresh-orange" />
                      <span className="text-nature-dark-green">ประวัติการสั่งซื้อ</span>
                    </button>
                    
                    <button 
                      onClick={() => handleOpenSearch('favorites')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200"
                    >
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-nature-dark-green">รายการโปรด ({customerData?.favorites.length || 0})</span>
                    </button>
                    
                    <button 
                      onClick={() => handleOpenSearch('following')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft-beige/30 rounded-lg transition-colors duration-200"
                    >
                      <UserPlus className="w-5 h-5 text-nature-green" />
                      <span className="text-nature-dark-green">เกษตรกรที่ติดตาม ({customerData?.following.length || 0})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        type={searchType}
        onUpdate={handleSearchModalUpdate}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => setShowEditProductModal(false)}
        onProductUpdated={handleProductUpdated}
        product={editingProduct}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={showOrderHistoryModal}
        onClose={() => setShowOrderHistoryModal(false)}
      />
    </div>
  );
};