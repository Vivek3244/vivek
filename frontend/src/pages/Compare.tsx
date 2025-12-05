import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Plus, Diamond, Eye, User, Calendar, MessageCircle,
  ArrowLeft, Star, Award, TrendingUp, ExternalLink
} from 'lucide-react';
import { useComparison } from '../hooks/useComparison';
import { Diamond as DiamondType } from '../types';

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const { diamonds, removeFromComparison, clearComparison } = useComparison();
  const [expandedDiamond, setExpandedDiamond] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInquire = (diamond: DiamondType) => {
    const message = `Hi! I'm interested in the ${diamond.name} (${diamond.carat} carat, ${diamond.cut} cut, ${diamond.color} color, ${diamond.clarity} clarity) priced at ${formatPrice(diamond.price)}. Could you please provide more details?`;
    const whatsappUrl = `https://wa.me/15551234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getBetterValue = (property: keyof DiamondType, currentValue: any, diamonds: DiamondType[]) => {
    const values = diamonds.map(d => d[property]);
    const uniqueValues = [...new Set(values)];

    if (uniqueValues.length <= 1) return false; // All same value

    switch (property) {
      case 'price':
        // Lower price is better
        return currentValue === Math.min(...values as number[]);
      case 'pricePerCarat':
        // Lower price per carat is better
        const pricePerCaratValues = diamonds.map(d => d.price / d.carat);
        const currentPricePerCarat = currentValue / (diamonds.find(d => d.price === currentValue)?.carat || 1);
        return currentPricePerCarat === Math.min(...pricePerCaratValues);
      case 'carat':
        // Higher carat is better
        return currentValue === Math.max(...values as number[]);
      case 'color':
        // Better color grades (D is best)
        const colorOrder = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
        const colorIndices = values.map(v => colorOrder.indexOf(v as string));
        return colorOrder.indexOf(currentValue as string) === Math.min(...colorIndices);
      case 'clarity':
        // Better clarity grades
        const clarityOrder = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
        const clarityIndices = values.map(v => clarityOrder.indexOf(v as string));
        return clarityOrder.indexOf(currentValue as string) === Math.min(...clarityIndices);
      case 'cut':
        // Better cut grades (simplified for this example)
        const cutOrder = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
        const cutIndices = values.map(v => cutOrder.indexOf(v as string));
        return cutOrder.indexOf(currentValue as string) === Math.min(...cutIndices);
      default:
        return false;
    }
  };

  const getCutColor = (cut: string) => {
    const cutColors: { [key: string]: string } = {
      'Excellent': 'bg-green-100 text-green-800 border-green-300',
      'Very Good': 'bg-blue-100 text-blue-800 border-blue-300',
      'Good': 'bg-orange-100 text-orange-800 border-orange-300',
      'Fair': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Poor': 'bg-red-100 text-red-800 border-red-300'
    };
    return cutColors[cut] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getBestValueBadge = (diamond: DiamondType) => {
    const pricePerCarat = diamond.price / diamond.carat;
    const avgPricePerCarat = diamonds.reduce((sum, d) => sum + (d.price / d.carat), 0) / diamonds.length;
    const hasGoodGrades = ['D', 'E', 'F'].includes(diamond.color) &&
                         ['FL', 'IF', 'VVS1', 'VVS2'].includes(diamond.clarity);

    if (pricePerCarat < avgPricePerCarat * 0.9 && hasGoodGrades) {
      return <Award className="w-5 h-5 text-amber-500" title="Best Value" />;
    }
    return null;
  };

  if (diamonds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <Diamond className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Diamonds to Compare</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start by adding diamonds from the purchase page to compare them side by side.
            </p>
            <button
              onClick={() => navigate('/purchase')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
            >
              <Plus className="w-6 h-6 mr-3" />
              Browse Diamonds
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/purchase')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Diamond className="w-8 h-8 mr-3 text-amber-500" />
                  Diamond Comparison
                </h1>
                <p className="text-gray-600 mt-1">Comparing {diamonds.length} diamond{diamonds.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {diamonds.length < 4 && (
                <button
                  onClick={() => navigate('/purchase')}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 flex items-center font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Diamond
                </button>
              )}
              <button
                onClick={clearComparison}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 font-semibold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-6 ${
          diamonds.length === 1 ? 'grid-cols-1' :
          diamonds.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          diamonds.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {diamonds.map((diamond, index) => {
            const isBetterValue = {
              price: getBetterValue('price', diamond.price, diamonds),
              carat: getBetterValue('carat', diamond.carat, diamonds),
              color: getBetterValue('color', diamond.color, diamonds),
              clarity: getBetterValue('clarity', diamond.clarity, diamonds),
              cut: getBetterValue('cut', diamond.cut, diamonds)
            };

            const bestValueBadge = getBestValueBadge(diamond);

            return (
              <div
                key={diamond._id}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  expandedDiamond === diamond._id ? 'scale-105 shadow-2xl border-amber-300' : 'border-gray-100'
                }`}
              >
                {/* Card Header */}
                <div className="relative p-4 border-b border-gray-100">
                  <button
                    onClick={() => removeFromComparison(diamond._id)}
                    className="absolute top-2 right-2 p-2 hover:bg-red-50 rounded-full transition-colors text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Diamond {index + 1}</span>
                    <div className="flex items-center space-x-1">
                      {bestValueBadge}
                      {isBetterValue.price && <TrendingUp className="w-4 h-4 text-green-500" title="Best Price" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 pr-8 line-clamp-2">
                    {diamond.name}
                  </h3>
                </div>

                {/* Diamond Image */}
                <div className="relative">
                  <img
                    src={diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                    alt={diamond.name}
                    className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setExpandedDiamond(expandedDiamond === diamond._id ? null : diamond._id)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
                    <Eye className="w-3 h-3 mr-1" />
                    {diamond.views}
                  </div>
                </div>

                {/* Price Section */}
                <div className={`p-4 border-b border-gray-100 ${isBetterValue.price ? 'bg-green-50' : ''}`}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(diamond.price)}</p>
                    <p className={`text-sm ${isBetterValue.price ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      {formatPrice(Math.round(diamond.price / diamond.carat))}/carat
                      {isBetterValue.price && ' ✓ Best Price'}
                    </p>
                  </div>
                </div>

                {/* 4Cs Section */}
                <div className="p-4 space-y-3">
                  {/* Carat */}
                  <div className={`flex justify-between items-center p-2 rounded-lg ${isBetterValue.carat ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                    <span className="text-sm font-medium text-gray-700">Carat</span>
                    <span className={`font-bold ${isBetterValue.carat ? 'text-green-800' : 'text-amber-600'}`}>
                      {diamond.carat}
                      {isBetterValue.carat && ' ✓'}
                    </span>
                  </div>

                  {/* Cut */}
                  <div className={`flex justify-between items-center p-2 rounded-lg border ${isBetterValue.cut ? getCutColor(diamond.cut) : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-sm font-medium text-gray-700">Cut</span>
                    <span className={`font-semibold ${isBetterValue.cut ? '' : 'text-gray-800'}`}>
                      {diamond.cut}
                      {isBetterValue.cut && ' ✓'}
                    </span>
                  </div>

                  {/* Color */}
                  <div className={`flex justify-between items-center p-2 rounded-lg ${isBetterValue.color ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                    <span className="text-sm font-medium text-gray-700">Color</span>
                    <span className={`font-bold ${isBetterValue.color ? 'text-green-800' : 'text-gray-800'}`}>
                      {diamond.color}
                      {isBetterValue.color && ' ✓'}
                    </span>
                  </div>

                  {/* Clarity */}
                  <div className={`flex justify-between items-center p-2 rounded-lg ${isBetterValue.clarity ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                    <span className="text-sm font-medium text-gray-700">Clarity</span>
                    <span className={`font-bold ${isBetterValue.clarity ? 'text-green-800' : 'text-gray-800'}`}>
                      {diamond.clarity}
                      {isBetterValue.clarity && ' ✓'}
                    </span>
                  </div>

                  {/* Additional Details */}
                  {diamond.certification && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                      <span className="text-sm font-medium text-blue-700">Certification</span>
                      <span className="font-semibold text-blue-800">{diamond.certification.institute}</span>
                    </div>
                  )}

                  {diamond.dimensions && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Dimensions</span>
                      <span className="text-sm text-gray-800">
                        {diamond.dimensions.length}×{diamond.dimensions.width}×{diamond.dimensions.depth}mm
                      </span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="p-4 border-t border-gray-100 bg-amber-50">
                  <div className="flex items-center text-sm text-amber-700">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium truncate">{diamond.seller?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(diamond.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => handleInquire(diamond)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center font-semibold text-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </button>

                  {diamonds.length > 1 && (
                    <button
                      onClick={() => setExpandedDiamond(expandedDiamond === diamond._id ? null : diamond._id)}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center font-semibold text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {expandedDiamond === diamond._id ? 'Collapse' : 'Expand Details'}
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedDiamond === diamond._id && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {diamond.description}
                    </p>

                    {diamond.fluorescence && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Fluorescence:</span>
                        <span className="ml-2 text-sm text-gray-800">{diamond.fluorescence}</span>
                      </div>
                    )}

                    {diamond.polish && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Polish:</span>
                        <span className="ml-2 text-sm text-gray-800">{diamond.polish}</span>
                      </div>
                    )}

                    {diamond.symmetry && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Symmetry:</span>
                        <span className="ml-2 text-sm text-gray-800">{diamond.symmetry}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add More Diamonds Card */}
        {diamonds.length < 4 && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/purchase')}
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all duration-300 group"
            >
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-amber-500 transition-colors" />
              <p className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
                Add Another Diamond
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {4 - diamonds.length} more slot{4 - diamonds.length !== 1 ? 's' : ''} available
              </p>
            </button>
          </div>
        )}

        {/* Comparison Summary */}
        {diamonds.length >= 2 && (
          <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-amber-500" />
              Comparison Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Best Price */}
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1">Best Price</p>
                <p className="font-bold text-green-900">
                  {formatPrice(Math.min(...diamonds.map(d => d.price)))}
                </p>
              </div>

              {/* Highest Carat */}
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-1">Highest Carat</p>
                <p className="font-bold text-blue-900">
                  {Math.max(...diamonds.map(d => d.carat))} ct
                </p>
              </div>

              {/* Best Color */}
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-700 mb-1">Best Color</p>
                <p className="font-bold text-purple-900">
                  {['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].find(
                    color => diamonds.some(d => d.color === color)
                  )}
                </p>
              </div>

              {/* Best Clarity */}
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-700 mb-1">Best Clarity</p>
                <p className="font-bold text-amber-900">
                  {['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'].find(
                    clarity => diamonds.some(d => d.clarity === clarity)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;