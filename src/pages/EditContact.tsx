import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '@/store/store';
import { usePermissions } from '@/hooks/usePermissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Upload, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save, User, Mail, Phone as PhoneIcon, Building2, Tag, MapPin, Globe, Linkedin, Twitter, Hash, Star, Clock, FileText } from 'lucide-react';
import { useGetContactByIdQuery, useUpdateContactMutation, Email, Phone, Address, SocialLinks, CreateContactInput } from '@/store/services/contactsApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const validCategories = ["Public", "HR", "Employee", "Client", "Candidate", "Partner", "Vendor", "Other"];
const contactStatuses = ["active", "inactive", "lead", "client"];
const countries = ["USA", "Canada", "UK", "Australia", "Germany", "France", "Other"];

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasCategory } = usePermissions();
  const [updateContact, { isLoading }] = useUpdateContactMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log the ID and URL for debugging
  console.log('EditContact - ID from URL:', id);
  console.log('EditContact - Current URL:', window.location.href);

  // Fetch existing contact
  const { data: existingContact, isLoading: isLoadingContact, error: contactError } = useGetContactByIdQuery(id || '0', {
    skip: !id,
  });
  
  console.log('EditContact - Contact data:', { existingContact, isLoadingContact, contactError });

  const [formData, setFormData] = useState({
    name: '',
    primaryEmail: '',
    primaryPhone: '',
    company: '',
    categories: [] as string[],
    tags: [] as string[],
    status: 'active',
    leadScore: '',
    lastInteraction: undefined as Date | undefined,
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    addressCountry: 'USA',
    linkedin: '',
    twitter: '',
    website: '',
    notes: '',
    profileImage: null as string | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when contact is loaded
  useEffect(() => {
    if (existingContact) {
      // Extract primary email - handle both array format and direct email field
      let primaryEmail = '';
      if (existingContact.emails && Array.isArray(existingContact.emails) && existingContact.emails.length > 0) {
        primaryEmail = existingContact.emails.find((e: any) => e.is_primary)?.email || existingContact.emails[0]?.email || '';
      } else if (existingContact.email) {
        primaryEmail = existingContact.email;
      }

      // Extract primary phone - handle both array format and direct phone field
      let primaryPhone = '';
      if (existingContact.phones && Array.isArray(existingContact.phones) && existingContact.phones.length > 0) {
        primaryPhone = existingContact.phones.find((p: any) => p.is_primary)?.number || existingContact.phones[0]?.number || '';
      } else if (existingContact.phone) {
        primaryPhone = existingContact.phone;
      }

      // Extract primary address
      const primaryAddress = existingContact.addresses && Array.isArray(existingContact.addresses) && existingContact.addresses.length > 0
        ? (existingContact.addresses.find((a: any) => a.is_primary) || existingContact.addresses[0])
        : null;

      // Construct full URL for profile photo if it's a relative path
      let profilePhotoUrl = null;
      if (existingContact.profile_photo) {
        if (existingContact.profile_photo.startsWith('http')) {
          profilePhotoUrl = existingContact.profile_photo;
        } else if (existingContact.profile_photo.startsWith('/')) {
          profilePhotoUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${existingContact.profile_photo}`;
        } else {
          profilePhotoUrl = existingContact.profile_photo;
        }
      }

      const formDataToSet = {
        name: existingContact.name || '',
        primaryEmail: primaryEmail,
        primaryPhone: primaryPhone,
        company: existingContact.company || '',
        categories: Array.isArray(existingContact.categories) ? existingContact.categories : [],
        tags: Array.isArray(existingContact.tags) ? existingContact.tags : [],
        status: existingContact.status || 'active',
        leadScore: existingContact.leadScore !== null && existingContact.leadScore !== undefined 
          ? existingContact.leadScore.toString() 
          : '',
        lastInteraction: existingContact.lastInteraction 
          ? new Date(existingContact.lastInteraction) 
          : undefined,
        addressStreet: primaryAddress?.street || '',
        addressCity: primaryAddress?.city || '',
        addressState: primaryAddress?.state || '',
        addressPostalCode: primaryAddress?.postal_code || '',
        addressCountry: primaryAddress?.country || 'USA',
        linkedin: existingContact.social_links?.linkedin || '',
        twitter: existingContact.social_links?.twitter || '',
        website: existingContact.social_links?.website || '',
        notes: Array.isArray(existingContact.notes) 
          ? existingContact.notes.join('') 
          : (existingContact.notes || ''),
        profileImage: profilePhotoUrl,
      };

      setFormData(formDataToSet);
      setPreviewImage(profilePhotoUrl);
      // Reset file state when loading existing contact
      setProfileImageFile(null);
    }
  }, [existingContact]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      // Store the File object for FormData upload
      setProfileImageFile(file);
      // Also create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileImageFile(null);
    setFormData(prev => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Ensure value is always a string, not an array
    const stringValue = Array.isArray(value) ? value.join('') : String(value);
    setFormData(prev => ({ ...prev, [field]: stringValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      } else {
        toast.info('Tag already added');
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) {
      newErrors.primaryEmail = 'Please enter a valid email address';
    }
    if (!formData.primaryPhone.trim()) newErrors.primaryPhone = 'Phone is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (formData.categories.length === 0) newErrors.categories = 'Please select at least one category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const emails: Email[] = [{ email: formData.primaryEmail.trim(), type: 'work', is_primary: true }];
      const phones: Phone[] = [{ number: formData.primaryPhone.trim(), type: 'mobile', is_primary: true }];
      const addresses: Address[] = [];
      if (formData.addressStreet || formData.addressCity || formData.addressState || formData.addressPostalCode) {
        addresses.push({
          type: 'work',
          street: formData.addressStreet.trim(),
          city: formData.addressCity.trim(),
          state: formData.addressState.trim(),
          postal_code: formData.addressPostalCode.trim(),
          country: formData.addressCountry,
          is_primary: true,
        });
      }

      const social_links: SocialLinks = {};
      if (formData.linkedin.trim()) social_links.linkedin = formData.linkedin.trim();
      if (formData.twitter.trim()) social_links.twitter = formData.twitter.trim();
      if (formData.website.trim()) social_links.website = formData.website.trim();

      // Prepare notes - if it's a string, convert to array for backend
      let notesArray: string[] = [];
      if (formData.notes && formData.notes.trim()) {
        // If notes is a string, create a new note
        notesArray = [formData.notes.trim()];
      }

      const payload: Partial<CreateContactInput> = {
        name: formData.name.trim(),
        emails,
        phones,
        company: formData.company.trim(),
        categories: formData.categories.length > 0 ? formData.categories : ['Other'],
        tags: formData.tags,
        notes: notesArray.length > 0 ? notesArray : undefined,
        status: formData.status,
        leadScore: formData.leadScore ? parseInt(formData.leadScore) : undefined,
        lastInteraction: formData.lastInteraction ? formData.lastInteraction.toISOString() : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
        social_links: Object.keys(social_links).length > 0 ? social_links : undefined,
      };

      // If there's a new file to upload, use FormData (handled by mutation)
      // Otherwise, include profile_photo in payload if it's a URL
      if (!profileImageFile && formData.profileImage && !formData.profileImage.startsWith('data:')) {
        // Existing image URL - include in payload
        if (formData.profileImage.startsWith('http') || formData.profileImage.startsWith('/')) {
          payload.profile_photo = formData.profileImage;
        }
      }

      console.log('Updating contact with payload:', { id, payload, hasFile: !!profileImageFile });
      
      const result = await updateContact({ 
        id: String(id), 
        data: payload,
        profileImageFile: profileImageFile || undefined
      }).unwrap();

      console.log('Update successful:', result);
      toast.success('Contact updated successfully!');
      navigate(`/contacts/${id}`);
    } catch (error: any) {
      console.error('Error updating contact:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message
      });
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Failed to update contact';
      toast.error(errorMessage);
    }
  };

  const availableCategories = validCategories.filter(cat =>
    user?.role === 'Admin' || hasCategory(cat)
  );

  const displayCategories = availableCategories.length > 0
    ? availableCategories
    : (user?.role === 'Admin' ? validCategories : ['Other']);

  if (isLoadingContact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground mb-4">Loading contact...</p>
        </div>
      </AppLayout>
    );
  }

  if (!existingContact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground mb-4">Contact not found</p>
          <Button onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (displayCategories.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground mb-4">No categories available</p>
          <Button onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/contacts/${id}`)}
            className="border-2 border-border/50 hover:border-primary transition-all hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contact
          </Button>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Edit Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/30">
                      <AvatarImage src={previewImage || undefined} alt={formData.name} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        {formData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {previewImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {previewImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className={errors.company ? 'border-destructive' : ''}
                    />
                    {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={formData.primaryEmail}
                      onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                      className={errors.primaryEmail ? 'border-destructive' : ''}
                    />
                    {errors.primaryEmail && <p className="text-sm text-destructive">{errors.primaryEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone" className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="primaryPhone"
                      value={formData.primaryPhone}
                      onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                      className={errors.primaryPhone ? 'border-destructive' : ''}
                    />
                    {errors.primaryPhone && <p className="text-sm text-destructive">{errors.primaryPhone}</p>}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                    {displayCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.categories && <p className="text-sm text-destructive">{errors.categories}</p>}
                </div>

                {/* Status and Lead Score */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contactStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadScore" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Lead Score
                    </Label>
                    <Input
                      id="leadScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.leadScore}
                      onChange={(e) => handleInputChange('leadScore', e.target.value)}
                    />
                  </div>
                </div>

                {/* Last Interaction */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Last Interaction
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.lastInteraction && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.lastInteraction ? format(formData.lastInteraction, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.lastInteraction}
                        onSelect={(date) => setFormData(prev => ({ ...prev, lastInteraction: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Address */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    Address
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">Street</Label>
                      <Input
                        id="addressStreet"
                        value={formData.addressStreet}
                        onChange={(e) => handleInputChange('addressStreet', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressCity">City</Label>
                      <Input
                        id="addressCity"
                        value={formData.addressCity}
                        onChange={(e) => handleInputChange('addressCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressState">State</Label>
                      <Input
                        id="addressState"
                        value={formData.addressState}
                        onChange={(e) => handleInputChange('addressState', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressPostalCode">Postal Code</Label>
                      <Input
                        id="addressPostalCode"
                        value={formData.addressPostalCode}
                        onChange={(e) => handleInputChange('addressPostalCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressCountry">Country</Label>
                      <Select value={formData.addressCountry} onValueChange={(value) => handleInputChange('addressCountry', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={Array.isArray(formData.notes) ? formData.notes.join('') : String(formData.notes || '')}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes about this contact..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[60px]">
                    {formData.tags.map(tag => (
                      <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-sm">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Input
                      id="tags"
                      placeholder="Type and press Enter to add tag"
                      onKeyDown={handleAddTag}
                      className="flex-1 min-w-[200px] border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/contacts/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Updating...' : 'Update Contact'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default EditContact;

