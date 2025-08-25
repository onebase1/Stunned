'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  TrendingUp,
  Eye,
  Edit
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { PropertyService } from '@/lib/supabase-service';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties');
      if (res.ok) {
        const payload = await res.json();
        setProperties(payload?.data || payload || []);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
      // Fallback to mock data
      setProperties([
        {
          id: 1,
          property_name: 'Luxury Villa - Sunset Heights',
          location: 'Beverly Hills, CA',
          price: 2500000,
          property_type: 'Villa',
          bedrooms: 5,
          bathrooms: 4,
          square_footage: 4500,
          status: 'Available',
          construction_status: 'Completed',
          listing_date: '2024-01-10',
          description: 'Stunning luxury villa with panoramic city views',
          amenities: ['Pool', 'Garden', 'Garage', 'Security System']
        },
        {
          id: 2,
          property_name: 'Downtown Condo - City Center',
          location: 'Downtown LA, CA',
          price: 850000,
          property_type: 'Condo',
          bedrooms: 2,
          bathrooms: 2,
          square_footage: 1200,
          status: 'Available',
          construction_status: 'Completed',
          listing_date: '2024-01-08',
          description: 'Modern condo in the heart of downtown',
          amenities: ['Gym', 'Rooftop', 'Concierge', 'Parking']
        },
        {
          id: 3,
          property_name: 'Family Home - Green Valley',
          location: 'Pasadena, CA',
          price: 1200000,
          property_type: 'House',
          bedrooms: 4,
          bathrooms: 3,
          square_footage: 2800,
          status: 'Under Contract',
          construction_status: 'Completed',
          listing_date: '2024-01-05',
          description: 'Perfect family home in quiet neighborhood',
          amenities: ['Backyard', 'Garage', 'Fireplace', 'Updated Kitchen']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'under contract': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'off market': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConstructionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'under construction': return 'bg-orange-100 text-orange-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProperties = properties.filter(property =>
    property.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter((p: any) => (p.available === true) || (p.status === 'Available')).length,
    underContract: properties.filter((p: any) => (p.status || '').toLowerCase() === 'under contract').length,
    totalValue: properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0)
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Portfolio</h1>
            <p className="text-gray-600">Manage your real estate inventory and listings</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                  <p className="text-xs text-blue-600">Active listings</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.availableProperties}</p>
                  <p className="text-xs text-green-600">Ready for sale</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Contract</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.underContract}</p>
                  <p className="text-xs text-yellow-600">In progress</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${(stats.totalValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-purple-600">Portfolio value</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Property Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{property.property_name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">{property.property_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium text-green-600">
                        ${(property.price / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                      <Badge className={getConstructionStatusColor(property.construction_status)}>
                        {property.construction_status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Listed: {new Date(property.listing_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or add a new property.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
