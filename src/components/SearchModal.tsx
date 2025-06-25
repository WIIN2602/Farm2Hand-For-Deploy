import React, { useState } from 'react';
import { X, Search, Heart, UserPlus, Star, MapPin, Package, Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { customerService } from '../services/customerService';
import { authService } from '../services/authService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'favorites' | 'following';
  onUpdate: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmer: string;
  location: string;
  rating: number;
  inStock: boolean;
  category: string;
}

interface Farmer {
  id: number;
  name: string;
  farmName: string;
  location: string;
  rating: number;
  products: number;
  followers: number;
  specialties: string[];
  avatar: string;
  verified: boolean;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'มะม่วงน้ำดอกไม้',
    price: 120,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายสมชาย ใจดี',
    location: 'จ.เชียงใหม่',
    rating: 4.8,
    inStock: true,
    category: 'ผลไม้'
  },
  {
    id: 2,
    name: 'ผักกาดหอมออร์แกนิค',
    price: 45,
    unit: 'ถุง',
    image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายวิชัย ผักสด',
    location: 'จ.เลย',
    rating: 4.9,
    inStock: true,
    category: 'ผักใบเขียว'
  },
  {
    id: 3,
    name: 'มะเขือเทศราชินี',
    price: 80,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายประสิทธิ์ เกษตรกร',
    location: 'จ.นครปฐม',
    rating: 4.7,
    inStock: true,
    category: 'ผัก'
  },
  {
    id: 4,
    name: 'กล้วยหอมทอง',
    price: 60,
    unit: 'หวี',
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายสมชาย ใจดี',
    location: 'จ.เชียงใหม่',
    rating: 4.6,
    inStock: true,
    category: 'ผลไม้'
  },
  {
    id: 5,
    name: 'แครอทเบบี้',
    price: 95,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายวิชัย ผักสด',
    location: 'จ.เลย',
    rating: 4.8,
    inStock: true,
    category: 'ผัก'
  },
  {
    id: 6,
    name: 'ข้าวหอมมะลิ',
    price: 45,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายประสิทธิ์ เกษตรกร',
    location: 'จ.นครปฐม',
    rating: 4.9,
    inStock: true,
    category: 'ข้าว'
  },
  {
    id: 7,
    name: 'ไข่ไก่สด',
    price: 120,
    unit: 'แผง',
    image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายสมชาย ใจดี',
    location: 'จ.เชียงใหม่',
    rating: 4.7,
    inStock: true,
    category: 'ไข่'
  },
  {
    id: 8,
    name: 'ส้มโอขาวน้ำหวาน',
    price: 150,
    unit: 'ลูก',
    image: 'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=300',
    farmer: 'นายวิชัย ผักสด',
    location: 'จ.เลย',
    rating: 4.9,
    inStock: false,
    category: 'ผลไม้'
  }
];

const mockFarmers: Farmer[] = [
  {
    id: 1,
    name: 'นายสมชาย ใจดี',
    farmName: 'สวนออร์แกนิคสมชาย',
    location: 'จ.เชียงใหม่, อ.แม่ริม',
    rating: 4.8,
    products: 15,
    followers: 234,
    specialties: ['ผลไม้', 'ไข่ไก่', 'ผักออร์แกนิค'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    verified: true
  },
  {
    id: 2,
    name: 'นายวิชัย ผักสด',
    farmName: 'ฟาร์มผักสดวิชัย',
    location: 'จ.เลย, อ.เมือง',
    rating: 4.9,
    products: 22,
    followers: 189,
    specialties: ['ผักใบเขียว', 'ผลไม้', 'สมุนไพร'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    verified: true
  },
  {
    id: 3,
    name: 'นายประสิทธิ์ เกษตรกร',
    farmName: 'ฟาร์มประสิทธิ์',
    location: 'จ.นครปฐม, อ.กำแพงแสน',
    rating: 4.7,
    products: 18,
    followers: 156,
    specialties: ['ข้าว', 'ผัก', 'ผลไม้'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    verified: true
  },
  {
    id: 4,
    name: 'นางสาวสุมาลี เกษตรดี',
    farmName: 'ฟาร์มออร์แกนิคสุมาลี',
    location: 'จ.ขอนแก่น, อ.เมือง',
    rating: 4.6,
    products: 12,
    followers: 98,
    specialties: ['ผักออร์แกนิค', 'สมุนไพร'],
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
    verified: false
  },
  {
    id: 5,
    name: 'นายชาญชัย ผลไม้',
    farmName: 'สวนผลไม้ชาญชัย',
    location: 'จ.ระยอง, อ.บ้านฉาง',
    rating: 4.8,
    products: 25,
    followers: 312,
    specialties: ['ผลไม้เมืองร้อน', 'ทุเรียน', 'มังคุด'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    verified: true
  }
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, type, onUpdate }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [currentFavorites, setCurrentFavorites] = useState<string[]>([]);
  const [currentFollowing, setCurrentFollowing] = useState<string[]>([]);

  // Load current customer data when modal opens
  React.useEffect(() => {
    if (isOpen && user) {
      loadCurrentData();
    }
  }, [isOpen, user]);

  const loadCurrentData = async () => {
    if (!user) return;
    
    try {
      const customerData = await customerService.getCustomerData(user.id);
      if (customerData) {
        setCurrentFavorites(customerData.favorites);
        setCurrentFollowing(customerData.following);
      }
    } catch (error) {
      console.error('Failed to load customer data:', error);
    }
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFarmers = mockFarmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddFavorite = async (productName: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await customerService.addFavorite(user.id, productName);
      setAddedItems(prev => new Set([...prev, productName]));
      setCurrentFavorites(prev => [...prev, productName]);
      onUpdate();
      
      // Show success feedback
      setTimeout(() => {
        setAddedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productName);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to add favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowFarmer = async (farmerName: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await customerService.followFarmer(user.id, farmerName);
      setAddedItems(prev => new Set([...prev, farmerName]));
      setCurrentFollowing(prev => [...prev, farmerName]);
      onUpdate();
      
      // Show success feedback
      setTimeout(() => {
        setAddedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(farmerName);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to follow farmer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nature-green rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
              <img 
                src="/farm2hand-logo.png" 
                alt="Farm2Hand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-nature-dark-green">
              {type === 'favorites' ? 'ค้นหาสินค้าที่ชอบ' : 'ค้นหาเกษตรกรที่น่าสนใจ'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-border-beige">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cool-gray" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={type === 'favorites' ? 'ค้นหาสินค้า เกษตรกร หรือหมวดหมู่...' : 'ค้นหาเกษตรกร ฟาร์ม หรือความเชี่ยวชาญ...'}
              className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {type === 'favorites' ? (
            /* Products Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isAlreadyFavorite = currentFavorites.includes(product.name);
                const isJustAdded = addedItems.has(product.name);
                
                return (
                  <div key={product.id} className="bg-white border border-border-beige rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {/* Product Image */}
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded-full">
                            หมด
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h4 className="font-semibold text-nature-dark-green mb-1 text-sm truncate">
                        {product.name}
                      </h4>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-fresh-orange">
                          ฿{product.price}
                        </span>
                        <span className="text-xs text-cool-gray">
                          /{product.unit}
                        </span>
                      </div>

                      {/* Farmer & Location */}
                      <div className="text-xs text-cool-gray mb-2">
                        <p className="truncate">{product.farmer}</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{product.location}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-sun-yellow text-sun-yellow" />
                          <span className="text-xs font-medium text-cool-gray">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-nature-green/10 text-nature-dark-green rounded-full">
                          {product.category}
                        </span>
                      </div>

                      {/* Add to Favorites Button */}
                      <button
                        onClick={() => handleAddFavorite(product.name)}
                        disabled={loading || isAlreadyFavorite || !product.inStock}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                          isAlreadyFavorite
                            ? 'bg-cool-gray/20 text-cool-gray cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-nature-green text-white'
                            : product.inStock
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-cool-gray/20 text-cool-gray cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isJustAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            เพิ่มแล้ว
                          </>
                        ) : isAlreadyFavorite ? (
                          <>
                            <Heart className="w-4 h-4 fill-red-500" />
                            ชอบแล้ว
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            เพิ่มในรายการโปรด
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Farmers Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFarmers.map((farmer) => {
                const isAlreadyFollowing = currentFollowing.includes(farmer.name);
                const isJustAdded = addedItems.has(farmer.name);
                
                return (
                  <div key={farmer.id} className="bg-white border border-border-beige rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    {/* Farmer Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={farmer.avatar}
                          alt={farmer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {farmer.verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-nature-green rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-nature-dark-green text-sm truncate">
                          {farmer.name}
                        </h4>
                        <p className="text-xs text-nature-green font-medium truncate">
                          {farmer.farmName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-cool-gray">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{farmer.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-sun-yellow text-sun-yellow" />
                          <span className="text-xs font-bold text-nature-dark-green">{farmer.rating}</span>
                        </div>
                        <p className="text-xs text-cool-gray">คะแนน</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package className="w-3 h-3 text-nature-green" />
                          <span className="text-xs font-bold text-nature-dark-green">{farmer.products}</span>
                        </div>
                        <p className="text-xs text-cool-gray">สินค้า</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserPlus className="w-3 h-3 text-nature-brown" />
                          <span className="text-xs font-bold text-nature-dark-green">{farmer.followers}</span>
                        </div>
                        <p className="text-xs text-cool-gray">ผู้ติดตาม</p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-3">
                      <p className="text-xs text-cool-gray mb-1">ความเชี่ยวชาญ:</p>
                      <div className="flex flex-wrap gap-1">
                        {farmer.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-nature-green/10 text-nature-dark-green rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Follow Button */}
                    <button
                      onClick={() => handleFollowFarmer(farmer.name)}
                      disabled={loading || isAlreadyFollowing}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                        isAlreadyFollowing
                          ? 'bg-cool-gray/20 text-cool-gray cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-nature-green text-white'
                          : 'bg-nature-green hover:bg-nature-dark-green text-white'
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          ติดตามแล้ว
                        </>
                      ) : isAlreadyFollowing ? (
                        <>
                          <UserPlus className="w-4 h-4 fill-nature-green" />
                          กำลังติดตาม
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          ติดตาม
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {((type === 'favorites' && filteredProducts.length === 0) || 
            (type === 'following' && filteredFarmers.length === 0)) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cool-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-cool-gray/50" />
              </div>
              <h3 className="text-lg font-semibold text-nature-dark-green mb-2">
                ไม่พบผลการค้นหา
              </h3>
              <p className="text-cool-gray">
                ลองใช้คำค้นหาอื่น หรือเลือกดูทั้งหมด
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-beige p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-cool-gray">
              {type === 'favorites' 
                ? `พบสินค้า ${filteredProducts.length} รายการ`
                : `พบเกษตรกร ${filteredFarmers.length} ราย`
              }
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};