/* FULL CODE WITH MOBILE SCROLL ENABLED */

import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Wrench, Plus, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import axios, { AxiosResponse } from 'axios';
import Global_API_BASE from '../services/GlobalConstants';

// Reusable component for Read More / Read Less
function DescriptionWithToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 120;

  if (!text) return null;

  const isLong = text.length > MAX_LENGTH;
  const displayText = expanded ? text : text.slice(0, MAX_LENGTH);

  return (
    <p className="text-sm md:text-base text-black leading-relaxed w-full break-words">
      {displayText}
      {isLong && (
        <>
          {!expanded && "... "}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 font-semibold hover:underline ml-1"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        </>
      )}
    </p>
  );
}

export interface Service {
  id: string;
  title: string;
  description: string;
  details: string;
  image: string;
  price: number;
  rating: number;
  bookingCount: number;
  duration: number;
  category: string;
  type: string;
  service_package: string;
  tags: string[];
  available: boolean;
  overview: string;
  our_process: string;
  benefits: string;
  whats_included: string;
  whats_not_included: string;
  why_choose_us: string;
  kushi_teamwork: string;
  faq: string;
  remarks?: string;
  created_by?: string;
  updated_by?: string;
  create_date?: string;
  updated_date?: string;
}

const initialEmptyFormData = {
  service_name: '',
  service_cost: '',
  service_description: '',
  service_details: '',
  service_image_url: '',
  service_category: '',
  service_type: '',
  service_package: '',
  rating: '',
  rating_count: '',
  remarks: '',
  created_by: '',
  updated_by: '',
  create_date: '',
  updated_date: '',
  active: 'Y',
  overview: '',
  our_process: '',
  benefits: '',
  whats_included: '',
  whats_not_included: '',
  why_choose_us: '',
  kushi_teamwork: '',
  faq: '',
};

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [viewService, setViewService] = useState<Service | null>(null);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [packages, setPackages] = useState<{
    description: string; name: string, price: string
  }[]>([]);

  const handlePackageChange = (index: number, field: 'name' | 'price' | 'description', value: string) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const addPackage = () => setPackages([...packages, { name: '', price: '', description: "" }]);
  const removePackage = (index: number) => setPackages(packages.filter((_, i) => i !== index));

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({ ...initialEmptyFormData });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(Global_API_BASE + '/api/customers/all-services');
        const data = response.data;
        const mappedServices = data.map((item: any) => ({
          id: item.service_id?.toString() || crypto.randomUUID(),
          title: item.service_name,
          description: item.service_description,
          details: item.service_details,
          image: item.service_image_url,
          price: Number(item.service_cost) || 0,
          rating: Number(item.rating) || 0,
          bookingCount: Number(item.rating_count) || 0,
          duration: 60,
          category: item.service_category || 'General',
          type: item.service_type || 'Other',
          service_package: item.service_package || '',
          tags: [],
          available: item.active === 'Y',
          overview: item.overview,
          our_process: item.our_process,
          benefits: item.benefits,
          whats_included: item.whats_included,
          whats_not_included: item.whats_not_included,
          why_choose_us: item.why_choose_us,
          kushi_teamwork: item.kushi_teamwork,
          faq: item.faq,
        }));
        setServices(mappedServices);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (service: Service) => {
    setFormData({
      service_name: service.title,
      service_cost: service.price.toString(),
      service_description: service.description,
      service_details: service.details,
      service_image_url: service.image,
      service_category: service.category,
      service_type: service.type,
      service_package: service.service_package,
      rating: service.rating.toString(),
      rating_count: service.bookingCount.toString(),
      remarks: service.remarks || '',
      created_by: service.created_by || '',
      updated_by: service.updated_by || '',
      create_date: service.create_date || '',
      updated_date: service.updated_date || '',
      active: service.available ? 'Y' : 'N',
      overview: service.overview || '',
      our_process: service.our_process || '',
      benefits: service.benefits || '',
      whats_included: service.whats_included || '',
      whats_not_included: service.whats_not_included || '',
      why_choose_us: service.why_choose_us || '',
      kushi_teamwork: service.kushi_teamwork || '',
      faq: service.faq || '',
    });

    setPackages(
      service.service_package
        ? service.service_package.split(';').map(pkg => {
            const [name, price, description] = pkg.split(':');
            return { name, price, description: description || "" };
          })
        : []
    );
    setEditServiceId(service.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    formData.service_package = packages.map(p => `${p.name}:${p.price}:${p.description || ""}`).join(';');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append(
        "service",
        new Blob([JSON.stringify({
          ...formData,
          service_id: editServiceId,
          updated_date: new Date().toISOString().split("T")[0],
        })], { type: "application/json" })
      );

      if (serviceImageFile) {
        formDataToSend.append("image", serviceImageFile);
      }

      let response: AxiosResponse<any, any>;
      if (isEditing && editServiceId) {
        response = await axios.put(Global_API_BASE + `/api/customers/update-service/${editServiceId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        setServices(prev =>
          prev.map(s =>
            s.id === editServiceId
              ? {
                  ...s,
                  title: response.data.service_name,
                  description: response.data.service_description,
                  details: response.data.service_details,
                  image: response.data.service_image_url,
                  price: Number(response.data.service_cost) || 0,
                  rating: Number(response.data.rating) || 0,
                  bookingCount: Number(response.data.rating_count) || 0,
                  category: response.data.service_category || 'General',
                  type: response.data.service_type || 'Other',
                  service_package: response.data.service_package || '',
                  available: response.data.active === 'Y',
                  overview: response.data.overview,
                  our_process: response.data.our_process,
                  benefits: response.data.benefits,
                  whats_included: response.data.whats_included,
                  whats_not_included: response.data.whats_not_included,
                  why_choose_us: response.data.why_choose_us,
                  kushi_teamwork: response.data.kushi_teamwork,
                  faq: response.data.faq,
                }
              : s
          )
        );
        alert('Service updated successfully!');
      } else {
        response = await axios.post(Global_API_BASE + '/api/customers/add-service', formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        const newService: Service = {
          id: response.data.service_id?.toString() || crypto.randomUUID(),
          title: response.data.service_name,
          description: response.data.service_description,
          details: response.data.service_details,
          image: response.data.service_image_url,
          price: Number(response.data.service_cost) || 0,
          rating: Number(response.data.rating) || 0,
          bookingCount: Number(response.data.rating_count) || 0,
          duration: 60,
          category: response.data.service_category || 'General',
          type: response.data.service_type || 'Other',
          service_package: response.data.service_package || '',
          tags: [],
          available: response.data.active === 'Y',
          overview: response.data.overview,
          our_process: response.data.our_process,
          benefits: response.data.benefits,
          whats_included: response.data.whats_included,
          whats_not_included: response.data.whats_not_included,
          why_choose_us: response.data.why_choose_us,
          kushi_teamwork: response.data.kushi_teamwork,
          faq: response.data.faq,
        };
        setServices(prev => [newService, ...prev]);
        alert('Service added successfully!');
      }

      setShowForm(false);
      setIsEditing(false);
      setEditServiceId(null);
      setFormData({ ...initialEmptyFormData });
      setServiceImageFile(null);
    } catch (err) {
      console.error(err);
      alert(isEditing ? 'Failed to update service' : 'Failed to add service');
    }
  };

  const toggleAvailability = async (serviceId: string, currentAvailable: boolean) => {
    const newAvailable = !currentAvailable;
    const newStatus = newAvailable ? "Y" : "N";

    const prevServices = [...services];
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, available: newAvailable } : s
      )
    );

    alert(
      newAvailable
        ? "Service enabled successfully!"
        : "Service disabled successfully!"
    );

    try {
      await axios.put(
        Global_API_BASE + `/api/customers/${serviceId}/status`,
        null,
        { params: { status: newStatus } }
      );

    } catch (err) {
      console.error("Error updating service:", err);
      setServices(prevServices);
      alert("Failed to update service status. Please try again.");
    }
  };

  const handleDelete = async (serviceId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;

    setServices(prev => prev.filter(service => service.id !== serviceId));
    alert("Service deleted successfully!");
    try {
      await axios.delete(Global_API_BASE + `/api/customers/delete-service/${serviceId}`);
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const allCategories = Array.from(new Set(services.map(s => s.category)));
  const subcategories = selectedCategory === 'all'
    ? []
    : Array.from(new Set(services.filter(s => s.category === selectedCategory).map(s => s.type)));

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesType = selectedType === 'all' || service.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  /* ------------------------------------------------------
     ⭐ MOBILE SCROLL WRAPPER STARTS HERE
     ------------------------------------------------------ */
  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
      <div className="min-w-[950px]">

        {/* ORIGINAL CONTENT BELOW — NOT MODIFIED */}
        <div className="space-y-4 md:space-y-6">

          {/* Header and Add button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Wrench className="h-6 w-6 text-black" />
              <h1 className="text-xl md:text-2xl font-bold text-black truncate">Services Management</h1>
            </div>
            <Button className="flex-shrink-0" onClick={() => {
              setIsEditing(false);
              setShowForm(true);
              setFormData({ ...initialEmptyFormData });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add New Service</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedType('all');
                    }}
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {selectedCategory !== 'all' && (
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">All Subcategories</option>
                      {subcategories.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
            {filteredServices.map(service => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={
                      service.image && service.image.startsWith("http")
                        ? service.image
                        : service.image
                          ? `Global_API_BASE${service.image}`
                          : "/placeholder.png"
                    }
                    alt={service.title || "Service"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3 md:p-4 text-black flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-black text-sm md:text-base leading-tight line-clamp-2 flex-1">
                      {service.title}
                    </h3>

                    <Badge variant={service.available ? 'success' : 'danger'} className="ml-2">
                      {service.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>

                  {service.details && (
                    <p className="text-xs md:text-sm mt-1 text-justify">{service.details}</p>
                  )}

                  <div className="text-xs md:text-sm mt-1">
                    <div><b>Rating:</b> {service.rating} | <b>Bookings:</b> {service.bookingCount}</div>
                    <div><b>Category:</b> {service.category}</div>
                    <div><b>Subcategory:</b> {service.type}</div>
                  </div>

                  <div className="flex items-center space-x-1 md:space-x-2 flex-wrap gap-1 mt-auto pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setViewService(service)}
                    >
                      <Eye className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">View</span>
                    </Button>

                    <Button size="sm" variant="secondary" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant={service.available ? "danger" : "success"}
                      onClick={() => toggleAvailability(service.id, service.available)}
                    >
                      {service.available ? "Disable" : "Enable"}
                    </Button>

                    <Button size="sm" variant="danger" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Service Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleFormSubmit}
                className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col p-6 text-black"
                style={{ maxHeight: '90vh' }}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
                  <h2 className="text-2xl font-semibold">
                    {isEditing ? "Edit Service" : "Add New Service"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setEditServiceId(null);
                      setFormData({ ...initialEmptyFormData });
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="service_name" placeholder="Service Name" value={formData.service_name} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" required />
                    <input name="service_cost" placeholder="Service Cost" type="number" value={formData.service_cost} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <textarea
                      name="service_description"
                      placeholder="Description"
                      wrap="soft"
                      value={formData.service_description}
                      onChange={(e) => {
                        handleFormChange(e);
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                      }}
                      className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                    />

                    {/* File Upload */}
                    <div className="col-span-1 md:col-span-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setServiceImageFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
                      />
                    </div>

                    <input name="service_image_url" placeholder="Image URL" value={formData.service_image_url} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <input name="service_category" placeholder="Category" value={formData.service_category} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <input name="service_type" placeholder="Subcategory" value={formData.service_type} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />

                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="font-semibold">Service Packages</label>
                      {packages.map((pkg, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            placeholder="Package Name"
                            value={pkg.name}
                            onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                            className="input border border-black px-3 py-2 rounded-md text-black placeholder-black flex-1"
                            required
                          />
                          <input
                            placeholder="Price"
                            type="text"
                            value={pkg.price}
                            onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                            className="input border border-black px-3 py-2 rounded-md text-black placeholder-black w-32"
                          />

                          <textarea
                            placeholder="Package Description"
                            value={pkg.description || ""}
                            onChange={(e) =>
                              handlePackageChange(index, 'description', e.target.value)
                            }
                            className="input border border-black px-3 py-2 rounded-md text-black placeholder-black w-full resize-none"
                            rows={2}
                          />

                          <button type="button" onClick={() => removePackage(index)} className="text-red-500 font-bold">X</button>
                        </div>
                      ))}
                      <button type="button" onClick={addPackage} className="text-blue-500 font-bold mt-1">+ Add Package</button>
                    </div>

                    <input name="rating" placeholder="Rating" value={formData.rating} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <input name="rating_count" placeholder="Rating Count" value={formData.rating_count} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <input name="created_by" placeholder="Created By" value={formData.created_by} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />
                    <input name="updated_by" placeholder="Updated By" value={formData.updated_by} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black" />

                    <textarea name="overview" placeholder="Overview" wrap="soft" value={formData.overview} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="our_process" placeholder="Our Process" wrap="soft" value={formData.our_process} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="benefits" placeholder="Benefits" wrap="soft" value={formData.benefits} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="whats_included" placeholder="Whats Included" wrap="soft" value={formData.whats_included} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="whats_not_included" placeholder="Whats Not Included" wrap="soft" value={formData.whats_not_included} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="why_choose_us" placeholder="Why Choose Us" wrap="soft" value={formData.why_choose_us} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="kushi_teamwork" placeholder="Kushi Teamwork" wrap="soft" value={formData.kushi_teamwork} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                    <textarea name="faq" placeholder="FAQs" wrap="soft" value={formData.faq} onChange={handleFormChange} className="input border border-black px-3 py-2 rounded-md text-black placeholder-black overflow-auto" style={{ minHeight: '100px', resize: 'vertical' }} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
                  <Button type="button" variant="secondary" onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditServiceId(null);
                    setFormData({ ...initialEmptyFormData });
                    setServiceImageFile(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update Service" : "Add Service"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Service View Modal */}
          {viewService && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg w'all max-w-2xl flex flex-col p-6 text-black" style={{ maxHeight: '90vh' }}>
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
                  <h2 className="text-2xl font-semibold">{viewService.title}</h2>
                  <button
                    type="button"
                    onClick={() => setViewService(null)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={viewService?.image && viewService.image.startsWith("http")
                        ? viewService.image
                        : viewService?.image
                          ? `Global_API_BASE${viewService.image}`
                          : "/placeholder.png"}
                      alt={viewService?.title || "Service"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div>
                      <b>Description:</b>
                      <DescriptionWithToggle text={viewService.description} />
                    </div>

                    <p><b>Price:</b> ₹{viewService.price}</p>
                    <p><b>Category:</b> {viewService.category}</p>
                    <p><b>Subcategory:</b> {viewService.type}</p>
                    <p><b>Rating:</b> {viewService.rating}</p>
                    <p><b>Bookings:</b> {viewService.bookingCount}</p>
                    <p><b>Availability:</b> <Badge variant={viewService.available ? 'success' : 'danger'}>{viewService.available ? 'Available' : 'Unavailable'}</Badge></p>
                  </div>

                  <div>
                    <b>Packages:</b>
                    {viewService.service_package?.split(';').map((pkg, idx) => {
                      const [name, price] = pkg.split(':');
                      return <div key={idx}>{name}: ₹{price}</div>;
                    })}
                  </div>

                  {viewService.overview && (
                    <div>
                      <h4 className="font-semibold text-lg">Overview</h4>
                      <p className="whitespace-pre-wrap">{viewService.overview}</p>
                    </div>
                  )}

                  {viewService.our_process && (
                    <div>
                      <h4 className="font-semibold text-lg">Our Process</h4>
                      <p className="whitespace-pre-wrap">{viewService.our_process}</p>
                    </div>
                  )}

                  {viewService.benefits && (
                    <div>
                      <h4 className="font-semibold text-lg">Benefits</h4>
                      <p className="whitespace-pre-wrap">{viewService.benefits}</p>
                    </div>
                  )}

                  {viewService.whats_included && (
                    <div>
                      <h4 className="font-semibold text-lg">What's Included</h4>
                      <p className="whitespace-pre-wrap">{viewService.whats_included}</p>
                    </div>
                  )}

                  {viewService.whats_not_included && (
                    <div>
                      <h4 className="font-semibold text-lg">What's Not Included</h4>
                      <p className="whitespace-pre-wrap">{viewService.whats_not_included}</p>
                    </div>
                  )}

                  {viewService.why_choose_us && (
                    <div>
                      <h4 className="font-semibold text-lg">Why Choose Us</h4>
                      <p className="whitespace-pre-wrap">{viewService.why_choose_us}</p>
                    </div>
                  )}

                  {viewService.kushi_teamwork && (
                    <div>
                      <h4 className="font-semibold text-lg">Kushi Teamwork</h4>
                      <p className="whitespace-pre-wrap">{viewService.kushi_teamwork}</p>
                    </div>
                  )}

                  {viewService.faq && (
                    <div>
                      <h4 className="font-semibold text-lg">FAQs</h4>
                      <p className="whitespace-pre-wrap">{viewService.faq}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
