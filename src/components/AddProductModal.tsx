import React, { useState } from 'react';
import { X, Upload, Save, Loader2, AlertCircle, Package, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { productService, type CreateProductData } from '../services/productService';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const categories = [
  'ผลไม้',
  'ผัก', 
  'ผักใบเขียว',
  'ข้าว',
  'ไข่',
  'ผลไม้นอกฤดู',
  'สมุนไพร',
  'อื่นๆ'
];

const units = [
  'กก.',
  'ถุง',
  'ลูก',
  'หวี',
  'แผง',
  'กล่อง',
  'มัด',
  'ชิ้น'
];

const sampleImages = [
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=400'
];

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    price: 0,
    unit: 'กก.',
    category: 'ผลไม้',
    description: '',
    image: sampleImages[0],
    stock: 0,
    organic: false,
    discount: 0,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof CreateProductData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setFormData(prev => ({
      ...prev,
      image: sampleImages[index]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'farmer') {
      setError('เฉพาะเกษตรกรเท่านั้นที่สามารถเพิ่มสินค้าได้');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError('กรุณากรอกชื่อสินค้า');
      return;
    }

    if (formData.price <= 0) {
      setError('กรุณากรอกราคาที่ถูกต้อง');
      return;
    }

    if (formData.stock < 0) {
      setError('จำนวนสินค้าต้องไม่น้อยกว่า 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await productService.createProduct(user.id, formData);
      
      // Reset form
      setFormData({
        name: '',
        price: 0,
        unit: 'กก.',
        category: 'ผลไม้',
        description: '',
        image: sampleImages[0],
        stock: 0,
        organic: false,
        discount: 0,
        tags: []
      });
      setTagInput('');
      setSelectedImageIndex(0);
      
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Failed to create product:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nature-green rounded-lg flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-nature-dark-green">เพิ่มสินค้าใหม่</h2>
          </div>
          <button
            onClick={onClose}
            className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-nature-dark-green mb-2">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="เช่น มะม่วงน้ำดอกไม้"
                  required
                />
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-nature-dark-green mb-2">
                    ราคา (บาท) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                    <input
                      type="number"
                      id="price"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-nature-dark-green mb-2">
                    หน่วย *
                  </label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-nature-dark-green mb-2">
                  หมวดหมู่ *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Stock and Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-nature-dark-green mb-2">
                    จำนวนสินค้า
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-nature-dark-green mb-2">
                    ส่วนลด (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    value={formData.discount || ''}
                    onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Organic Checkbox */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.organic}
                    onChange={(e) => handleInputChange('organic', e.target.checked)}
                    className="w-4 h-4 text-nature-green focus:ring-nature-green border-border-beige rounded"
                  />
                  <span className="text-sm font-medium text-nature-dark-green">
                    สินค้าออร์แกนิค
                  </span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-nature-dark-green mb-2">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                  placeholder="อธิบายรายละเอียดสินค้า คุณภาพ วิธีการปลูก ฯลฯ"
                />
              </div>
            </div>

            {/* Right Column - Image and Tags */}
            <div className="space-y-4">
              {/* Image Selection */}
              <div>
                <label className="block text-sm font-medium text-nature-dark-green mb-2">
                  รูปภาพสินค้า
                </label>
                
                {/* Selected Image Preview */}
                <div className="mb-4">
                  <div className="relative w-full h-48 border-2 border-dashed border-border-beige rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      ตัวอย่าง
                    </div>
                  </div>
                </div>

                {/* Image Options */}
                <div className="grid grid-cols-4 gap-2">
                  {sampleImages.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleImageSelect(index)}
                      className={`relative w-full h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-nature-green ring-2 ring-nature-green/20'
                          : 'border-border-beige hover:border-nature-green/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Option ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-nature-green/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-nature-green rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-nature-dark-green mb-2">
                  แท็กสินค้า
                </label>
                
                {/* Tag Input */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-3 py-2 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                      placeholder="เช่น หวาน, สดใหม่, ออร์แกนิค"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="px-4 py-2 bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white rounded-lg transition-colors duration-200"
                  >
                    เพิ่ม
                  </button>
                </div>

                {/* Tags Display */}
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-nature-green/10 text-nature-dark-green rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-nature-green hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Product Preview */}
              <div className="bg-soft-beige/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-nature-dark-green mb-3">ตัวอย่างการแสดงผล</h3>
                <div className="bg-white rounded-lg p-3 border border-border-beige">
                  <div className="flex items-start gap-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-nature-dark-green text-sm truncate">
                        {formData.name || 'ชื่อสินค้า'}
                      </h4>
                      <p className="text-fresh-orange font-bold text-sm">
                        ฿{formData.price || 0}/{formData.unit}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {formData.organic && (
                          <span className="text-xs px-2 py-0.5 bg-nature-green text-white rounded-full">
                            ออร์แกนิค
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-nature-green/10 text-nature-dark-green rounded-full">
                          {formData.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-beige">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-border-beige text-cool-gray hover:bg-soft-beige/30 rounded-lg font-medium transition-colors duration-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเพิ่มสินค้า...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  เพิ่มสินค้า
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};