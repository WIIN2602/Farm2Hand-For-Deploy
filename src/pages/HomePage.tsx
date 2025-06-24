import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, Users, TrendingUp, Star, ArrowRight, Leaf, Shield, Truck, Heart, MapPin, Package, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { productService, type Product, type CategoryWithCount } from '../services/productService';
import { statsService, type AppStats } from '../services/statsService';

const featuredProducts: Product[] = [
  {
    id: 1,
    name: 'มะม่วงน้ำดอกไม้',
    price: 120,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายสมชาย ใจดี',
    farmerId: 1,
    location: 'จ.เชียงใหม่',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    category: 'ผลไม้',
    description: 'มะม่วงน้ำดอกไม้สดใหม่ หวานฉ่ำ',
    organic: true,
    discount: 10,
    tags: ['หวาน', 'สดใหม่', 'ออร์แกนิค'],
    stock: 15
  },
  {
    id: 2,
    name: 'ผักกาดหอมออร์แกนิค',
    price: 45,
    unit: 'ถุง',
    image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายวิชัย ผักสด',
    farmerId: 2,
    location: 'จ.เลย',
    rating: 4.9,
    reviews: 203,
    inStock: true,
    category: 'ผักใบเขียว',
    description: 'ผักกาดหอมปลอดสารพิษ',
    organic: true,
    tags: ['ปลอดสารพิษ', 'สดใหม่', 'ออร์แกนิค'],
    stock: 25
  },
  {
    id: 3,
    name: 'มะเขือเทศราชินี',
    price: 80,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายประสิทธิ์ เกษตรกร',
    farmerId: 3,
    location: 'จ.นครปฐม',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    category: 'ผัก',
    description: 'มะเขือเทศราชินีสีแดงสด',
    organic: false,
    tags: ['หวาน', 'สดใหม่', 'คุณภาพดี'],
    stock: 30
  },
  {
    id: 4,
    name: 'กล้วยหอมทอง',
    price: 60,
    unit: 'หวี',
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายสมชาย ใจดี',
    farmerId: 1,
    location: 'จ.เชียงใหม่',
    rating: 4.6,
    reviews: 124,
    inStock: true,
    category: 'ผลไม้',
    description: 'กล้วยหอมทองหวานหอม',
    organic: false,
    discount: 5,
    tags: ['หวาน', 'สุกพอดี', 'หอม'],
    stock: 25
  },
  {
    id: 5,
    name: 'แครอทเบบี้',
    price: 95,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายวิชัย ผักสด',
    farmerId: 2,
    location: 'จ.เลย',
    rating: 4.8,
    reviews: 167,
    inStock: true,
    category: 'ผัก',
    description: 'แครอทเบบี้หวานกรอบ',
    organic: true,
    tags: ['หวาน', 'กรอบ', 'ออร์แกนิค'],
    stock: 15
  },
  {
    id: 6,
    name: 'ข้าวหอมมะลิ',
    price: 45,
    unit: 'กก.',
    image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
    farmer: 'นายประสิทธิ์ เกษตรกร',
    farmerId: 3,
    location: 'จ.นครปฐม',
    rating: 4.9,
    reviews: 245,
    inStock: true,
    category: 'ข้าว',
    description: 'ข้าวหอมมะลิแท้ 100%',
    organic: false,
    tags: ['หอม', 'หวาน', 'เก็บใหม่'],
    stock: 100
  }
];

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [stats, setStats] = useState<AppStats>({
    farmers: 0,
    customers: 0,
    products: 0,
    averageRating: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Load categories with counts from database
  useEffect(() => {
    loadCategoriesWithCounts();
    loadAppStats();
  }, []);

  const loadCategoriesWithCounts = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await productService.getCategoriesWithCounts();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback to static categories if database fails with updated emojis
      setCategories([
        { name: 'ผลไม้', icon: '🍇', count: 0, color: 'bg-purple-100 text-purple-700' },
        { name: 'ผัก', icon: '🥕', count: 0, color: 'bg-orange-100 text-orange-700' },
        { name: 'ผักใบเขียว', icon: '🥕', count: 0, color: 'bg-green-100 text-green-700' }, // Fresh Vegetables
        { name: 'ข้าว', icon: '🌾', count: 0, color: 'bg-yellow-100 text-yellow-700' },
        { name: 'ไข่', icon: '🥚', count: 0, color: 'bg-blue-100 text-blue-700' },
        { name: 'ผลไม้นอกฤดู', icon: '❄️', count: 0, color: 'bg-pink-100 text-pink-700' }, // Out-of-season Products
        { name: 'สมุนไพร', icon: '🌿', count: 0, color: 'bg-emerald-100 text-emerald-700' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAppStats = async () => {
    try {
      setLoadingStats(true);
      const appStats = await statsService.getAppStats();
      setStats(appStats);
    } catch (error) {
      console.error('Failed to load app stats:', error);
      // Keep default values if loading fails
    } finally {
      setLoadingStats(false);
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: 'ซื้อขายตรงจากเกษตรกร',
      description: 'เชื่อมต่อผู้บริโภคกับเกษตรกรโดยตรง ได้สินค้าสดใหม่ ราคาดี',
      color: 'bg-nature-green'
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant ช่วยเหลือ',
      description: 'ผู้ช่วยอัจฉริยะคอยให้คำแนะนำและช่วยเหลือตลอด 24 ชั่วโมง',
      color: 'bg-fresh-orange'
    },
    {
      icon: Shield,
      title: 'รับประกันคุณภาพ',
      description: 'สินค้าผ่านการตรวจสอบคุณภาพ มีการรับรองมาตรฐาน',
      color: 'bg-nature-brown'
    },
    {
      icon: Truck,
      title: 'จัดส่งรวดเร็ว',
      description: 'ระบบจัดส่งที่เชื่อถือได้ สินค้าถึงมือคุณอย่างปลอดภัย',
      color: 'bg-sun-yellow text-nature-dark-green'
    }
  ];

  // Dynamic stats with real data
  const dynamicStats = [
    { 
      number: loadingStats ? '...' : statsService.formatCount(stats.farmers), 
      label: 'เกษตรกร', 
      icon: Users 
    },
    { 
      number: loadingStats ? '...' : statsService.formatCount(stats.customers), 
      label: 'ลูกค้า', 
      icon: ShoppingBag 
    },
    { 
      number: loadingStats ? '...' : statsService.formatCount(stats.products), 
      label: 'สินค้า', 
      icon: Leaf 
    },
    { 
      number: loadingStats ? '...' : statsService.formatRating(stats.averageRating), 
      label: 'คะแนนเฉลี่ย', 
      icon: Star 
    }
  ];

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.discount 
      ? product.price * (1 - product.discount / 100)
      : product.price;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-border-beige overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.organic && (
              <span className="px-2 py-1 bg-nature-green text-white text-xs font-medium rounded-full">
                ออร์แกนิค
              </span>
            )}
            {product.discount && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {isAuthenticated && user?.role === 'customer' && (
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100">
              <Heart className="w-4 h-4 text-cool-gray hover:text-red-500" />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-nature-dark-green mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            {product.discount ? (
              <>
                <span className="text-lg font-bold text-fresh-orange">
                  ฿{discountedPrice.toFixed(0)}
                </span>
                <span className="text-sm text-cool-gray line-through">
                  ฿{product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-fresh-orange">
                ฿{product.price}
              </span>
            )}
            <span className="text-sm text-cool-gray">/{product.unit}</span>
          </div>

          {/* Farmer & Location */}
          <div className="text-sm text-cool-gray mb-2">
            <p className="truncate">{product.farmer}</p>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{product.location}</span>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-sun-yellow text-sun-yellow" />
              <span className="text-sm font-medium text-cool-gray">
                {product.rating} ({product.reviews})
              </span>
            </div>
            <span className="text-xs px-2 py-1 bg-nature-green/10 text-nature-dark-green rounded-full">
              {product.category}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-soft-beige text-nature-brown rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200">
            <ShoppingBag className="w-4 h-4" />
            เพิ่มในตะกร้า
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-nature-green/10 to-fresh-orange/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden p-4">
              <img 
                src="/farm2hand-logo.png" 
                alt="Farm2Hand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-nature-dark-green mb-6">
              Farm2Hand
            </h1>
            <p className="text-xl md:text-2xl text-nature-green font-medium mb-4">
              เชื่อมต่อเกษตรกรกับผู้บริโภค
            </p>
            <p className="text-lg text-cool-gray max-w-2xl mx-auto mb-8">
              แพลตฟอร์มซื้อขายสินค้าเกษตรออนไลน์ที่เชื่อมต่อเกษตรกรกับผู้บริโภคโดยตรง 
              พร้อมผู้ช่วย AI ที่คอยให้คำแนะนำและช่วยเหลือ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  เลือกซื้อสินค้า
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/chatbot"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-nature-green text-nature-green hover:bg-nature-green hover:text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  ลองใช้ AI Assistant
                </Link>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <p className="text-nature-dark-green mb-4">
                  ยินดีต้อนรับกลับมา, <span className="font-semibold">{user?.name}</span>!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    เลือกซื้อสินค้า
                  </Link>
                  <Link
                    to="/chatbot"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-nature-green text-nature-green hover:bg-nature-green hover:text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    AI Assistant
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {dynamicStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <IconComponent className="w-8 h-8 text-nature-green mx-auto mb-3" />
                  <div className="text-2xl font-bold text-nature-dark-green mb-1">
                    {loadingStats ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                      </div>
                    ) : (
                      stat.number
                    )}
                  </div>
                  <div className="text-sm text-cool-gray">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nature-dark-green mb-4">
              หมวดหมู่สินค้า
            </h2>
            <p className="text-lg text-cool-gray max-w-2xl mx-auto">
              เลือกซื้อสินค้าเกษตรคุณภาพดีจากหมวดหมู่ที่หลากหลาย
            </p>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                <span className="text-cool-gray">กำลังโหลดหมวดหมู่...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {categories.slice(0, 6).map((category, index) => (
                  <Link
                    key={index}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="bg-white rounded-xl p-6 shadow-sm border border-border-beige hover:shadow-lg transition-all duration-300 text-center group"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-nature-dark-green mb-2 group-hover:text-nature-green transition-colors">
                      {category.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                      {category.count} สินค้า
                    </span>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Search className="w-4 h-4" />
                  ดูสินค้าทั้งหมด
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-soft-beige to-light-beige">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nature-dark-green mb-4">
              สินค้าแนะนำ
            </h2>
            <p className="text-lg text-cool-gray max-w-2xl mx-auto">
              สินค้าเกษตรคุณภาพดีที่ได้รับความนิยมจากลูกค้า
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              ดูสินค้าทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nature-dark-green mb-4">
              ทำไมต้องเลือก Farm2Hand?
            </h2>
            <p className="text-lg text-cool-gray max-w-2xl mx-auto">
              เราให้บริการที่ครบครันและน่าเชื่อถือ เพื่อประสบการณ์การซื้อขายที่ดีที่สุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-nature-dark-green mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-cool-gray text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-nature-green to-nature-dark-green">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            เข้าร่วมกับเกษตรกรและผู้บริโภคหลายพันคนที่เชื่อใจ Farm2Hand
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-nature-green hover:bg-soft-beige rounded-lg font-medium transition-colors duration-200 shadow-lg">
                <Users className="w-5 h-5" />
                สมัครสมาชิก
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-nature-green rounded-lg font-medium transition-colors duration-200"
              >
                <ShoppingBag className="w-5 h-5" />
                เลือกซื้อสินค้า
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};