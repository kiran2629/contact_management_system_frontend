import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone as PhoneIcon,
  Building2,
  Tag,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Hash,
  Star,
  Clock,
  FileText,
} from "lucide-react";
import {
  useGetContactByIdQuery,
  useUpdateContactMutation,
  Email,
  Phone,
  Address,
  SocialLinks,
  CreateContactInput,
} from "@/store/services/contactsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const validCategories = [
  "Public",
  "HR",
  "Employee",
  "Client",
  "Candidate",
  "Partner",
  "Vendor",
  "Other",
];
const contactStatuses = ["active", "inactive", "lead", "client"];
const countries = [
  "USA",
  "Canada",
  "UK",
  "Australia",
  "Germany",
  "France",
  "Other",
];

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasCategory, canAccess, canEdit, canViewBirthdays } =
    usePermissions();
  const [updateContact, { isLoading }] = useUpdateContactMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log the ID and URL for debugging
  console.log("EditContact - ID from URL:", id);
  console.log("EditContact - Current URL:", window.location.href);

  // Fetch existing contact
  const {
    data: existingContact,
    isLoading: isLoadingContact,
    error: contactError,
  } = useGetContactByIdQuery(id || "0", {
    skip: !id,
  });

  console.log("EditContact - Contact data:", {
    existingContact,
    isLoadingContact,
    contactError,
  });

  const [formData, setFormData] = useState({
    name: "",
    primaryEmail: "",
    primaryPhone: "",
    company: "",
    categories: [] as string[],
    tags: [] as string[],
    status: "active",
    leadScore: "",
    lastInteraction: undefined as Date | undefined,
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
    addressCountry: "USA",
    linkedin: "",
    twitter: "",
    website: "",
    notes: [] as Array<{ _id?: string; note: string }>,
    profileImage: null as string | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when contact is loaded
  useEffect(() => {
    if (existingContact) {
      // Extract primary email - handle both array format and direct email field
      let primaryEmail = "";
      if (
        existingContact.emails &&
        Array.isArray(existingContact.emails) &&
        existingContact.emails.length > 0
      ) {
        primaryEmail =
          existingContact.emails.find((e: any) => e.is_primary)?.email ||
          existingContact.emails[0]?.email ||
          "";
      } else if (existingContact.email) {
        primaryEmail = existingContact.email;
      }

      // Extract primary phone - handle both array format and direct phone field
      let primaryPhone = "";
      if (
        existingContact.phones &&
        Array.isArray(existingContact.phones) &&
        existingContact.phones.length > 0
      ) {
        primaryPhone =
          existingContact.phones.find((p: any) => p.is_primary)?.number ||
          existingContact.phones[0]?.number ||
          "";
      } else if (existingContact.phone) {
        primaryPhone = existingContact.phone;
      }

      // Extract primary address
      const primaryAddress =
        existingContact.addresses &&
        Array.isArray(existingContact.addresses) &&
        existingContact.addresses.length > 0
          ? existingContact.addresses.find((a: any) => a.is_primary) ||
            existingContact.addresses[0]
          : null;

      // Construct full URL for profile photo if it's a relative path
      let profilePhotoUrl = null;
      if (existingContact.profile_photo) {
        if (existingContact.profile_photo.startsWith("http")) {
          profilePhotoUrl = existingContact.profile_photo;
        } else if (existingContact.profile_photo.startsWith("/")) {
          profilePhotoUrl = `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }${existingContact.profile_photo}`;
        } else {
          profilePhotoUrl = existingContact.profile_photo;
        }
      }

      const formDataToSet = {
        name: existingContact.name || "",
        primaryEmail: primaryEmail,
        primaryPhone: primaryPhone,
        company: existingContact.company || "",
        categories: Array.isArray(existingContact.categories)
          ? existingContact.categories
          : [],
        tags: Array.isArray(existingContact.tags) ? existingContact.tags : [],
        status: existingContact.status || "active",
        leadScore:
          existingContact.leadScore !== null &&
          existingContact.leadScore !== undefined
            ? existingContact.leadScore.toString()
            : "",
        lastInteraction: existingContact.lastInteraction
          ? new Date(existingContact.lastInteraction)
          : undefined,
        addressStreet: primaryAddress?.street || "",
        addressCity: primaryAddress?.city || "",
        addressState: primaryAddress?.state || "",
        addressPostalCode: primaryAddress?.postal_code || "",
        addressCountry: primaryAddress?.country || "USA",
        linkedin: existingContact.social_links?.linkedin || "",
        twitter: existingContact.social_links?.twitter || "",
        website: existingContact.social_links?.website || "",
        notes: existingContact.contactNotes && Array.isArray(existingContact.contactNotes) && existingContact.contactNotes.length > 0
          ? existingContact.contactNotes.map((note: any) => ({
              _id: note._id,
              note: note.note || note.content || note.text || ""
            }))
          : [],
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
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      // Store the File object for FormData upload
      setProfileImageFile(file);
      // Also create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData((prev) => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileImageFile(null);
    setFormData((prev) => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate individual field
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case "name":
        if (!value || !String(value).trim()) {
          return "Name is required";
        }
        const name = String(value).trim();
        if (name.length < 2) {
          return "Name must be at least 2 characters";
        }
        if (name.length > 100) {
          return "Name must be less than 100 characters";
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
          return "Name can only contain letters, spaces, hyphens, and apostrophes";
        }
        return "";

      case "primaryEmail":
        if (!value || !String(value).trim()) {
          return "Email is required";
        }
        const email = String(value).trim().toLowerCase();
        if (email.length > 255) {
          return "Email must be less than 255 characters";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return "Please enter a valid email address";
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          return "Email format is invalid";
        }
        return "";

      case "primaryPhone":
        if (!value || !String(value).trim()) {
          return "Phone is required";
        }
        const phone = String(value).trim();
        const digitsOnly = phone.replace(/\D/g, "");
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          return "Phone must be between 10 and 15 digits";
        }
        if (
          !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
            phone.replace(/\s/g, "")
          )
        ) {
          return "Please enter a valid phone number";
        }
        return "";

      case "company":
        if (!value || !String(value).trim()) {
          return "Company is required";
        }
        const company = String(value).trim();
        if (company.length < 2) {
          return "Company must be at least 2 characters";
        }
        if (company.length > 200) {
          return "Company must be less than 200 characters";
        }
        return "";

      case "categories":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return "Please select at least one category";
        }
        return "";

      case "linkedin":
        if (value && String(value).trim() !== "") {
          try {
            const url = new URL(String(value));
            if (
              url.protocol !== "https:" ||
              (url.hostname !== "www.linkedin.com" &&
                url.hostname !== "linkedin.com")
            ) {
              return "LinkedIn URL must start with https://www.linkedin.com/ or https://linkedin.com/";
            }
          } catch {
            return "Please enter a valid LinkedIn URL";
          }
        }
        return "";

      case "twitter":
        if (value && String(value).trim() !== "") {
          const twitter = String(value).trim();
          if (twitter.startsWith("http")) {
            try {
              new URL(twitter);
            } catch {
              return "Please enter a valid Twitter URL";
            }
          } else if (!/^@?[a-zA-Z0-9_]{1,15}$/.test(twitter.replace("@", ""))) {
            return "Twitter handle must be 1-15 characters (letters, numbers, underscore)";
          }
        }
        return "";

      case "website":
        if (value && String(value).trim() !== "") {
          try {
            const url = String(value).trim();
            const testUrl = url.startsWith("http") ? url : `https://${url}`;
            new URL(testUrl);
          } catch {
            return "Please enter a valid website URL";
          }
        }
        return "";

      case "leadScore":
        if (value && String(value).trim() !== "") {
          const leadScore = parseInt(String(value));
          if (isNaN(leadScore)) {
            return "Lead score must be a number";
          }
          if (leadScore < 0 || leadScore > 100) {
            return "Lead score must be between 0 and 100";
          }
        }
        return "";

      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Ensure value is always a string, not an array
    const stringValue = Array.isArray(value) ? value.join("") : String(value);
    setFormData((prev) => ({ ...prev, [field]: stringValue }));
    // Validate field immediately
    const error = validateField(field, stringValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      // Validate categories after toggle
      const error = validateField("categories", newCategories);
      setErrors((prev) => ({ ...prev, categories: error }));
      return { ...prev, categories: newCategories };
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      } else {
        toast.info("Tag already added");
      }
      e.currentTarget.value = "";
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Email validation
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = "Email is required";
    } else {
      const email = formData.primaryEmail.trim().toLowerCase();
      if (email.length > 255) {
        newErrors.primaryEmail = "Email must be less than 255 characters";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.primaryEmail = "Please enter a valid email address";
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ) {
        newErrors.primaryEmail = "Email format is invalid";
      }
    }

    // Phone validation
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Phone is required";
    } else {
      const phone = formData.primaryPhone.trim();
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.primaryPhone = "Phone must be between 10 and 15 digits";
      } else if (
        !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
          phone.replace(/\s/g, "")
        )
      ) {
        newErrors.primaryPhone = "Please enter a valid phone number";
      }
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    } else if (formData.company.trim().length < 2) {
      newErrors.company = "Company must be at least 2 characters";
    } else if (formData.company.length > 200) {
      newErrors.company = "Company must be less than 200 characters";
    }

    // Categories validation
    if (formData.categories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    // LinkedIn URL validation (optional)
    if (formData.linkedin && formData.linkedin.trim() !== "") {
      try {
        const url = new URL(formData.linkedin);
        if (
          url.protocol !== "https:" ||
          (url.hostname !== "www.linkedin.com" &&
            url.hostname !== "linkedin.com")
        ) {
          newErrors.linkedin =
            "LinkedIn URL must start with https://www.linkedin.com/ or https://linkedin.com/";
        }
      } catch {
        newErrors.linkedin = "Please enter a valid LinkedIn URL";
      }
    }

    // Twitter validation (optional)
    if (formData.twitter && formData.twitter.trim() !== "") {
      const twitter = formData.twitter.trim();
      if (twitter.startsWith("http")) {
        try {
          new URL(twitter);
        } catch {
          newErrors.twitter = "Please enter a valid Twitter URL";
        }
      } else if (!/^@?[a-zA-Z0-9_]{1,15}$/.test(twitter.replace("@", ""))) {
        newErrors.twitter =
          "Twitter handle must be 1-15 characters (letters, numbers, underscore)";
      }
    }

    // Website validation (optional)
    if (formData.website && formData.website.trim() !== "") {
      try {
        const url = formData.website.trim();
        const testUrl = url.startsWith("http") ? url : `https://${url}`;
        new URL(testUrl);
      } catch {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    // Address validation (optional)
    if (
      formData.addressStreet ||
      formData.addressCity ||
      formData.addressState ||
      formData.addressPostalCode
    ) {
      if (
        formData.addressStreet &&
        formData.addressStreet.trim().length > 200
      ) {
        newErrors.addressStreet =
          "Street address must be less than 200 characters";
      }
      if (formData.addressCity && formData.addressCity.trim().length > 100) {
        newErrors.addressCity = "City must be less than 100 characters";
      }
      if (formData.addressState && formData.addressState.trim().length > 100) {
        newErrors.addressState = "State must be less than 100 characters";
      }
      if (
        formData.addressPostalCode &&
        formData.addressPostalCode.trim().length > 20
      ) {
        newErrors.addressPostalCode =
          "Postal code must be less than 20 characters";
      }
    }

    // Lead Score validation (optional)
    if (formData.leadScore && formData.leadScore.trim() !== "") {
      const leadScore = parseInt(formData.leadScore);
      if (isNaN(leadScore)) {
        newErrors.leadScore = "Lead score must be a number";
      } else if (leadScore < 0 || leadScore > 100) {
        newErrors.leadScore = "Lead score must be between 0 and 100";
      }
    }

    // Notes validation (optional)
    if (formData.notes && Array.isArray(formData.notes)) {
      formData.notes.forEach((note, index) => {
        if (note.note && note.note.length > 5000) {
          newErrors[`notes.${index}`] =
            "Each note must be less than 5000 characters";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permissions before submission
    if (!canEdit("contact") && user?.role !== "Admin") {
      toast.error("You don't have permission to update contacts");
      navigate("/contacts");
      return;
    }

    if (!validateForm() || !id) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const emails: Email[] = [
        { email: formData.primaryEmail.trim(), type: "work", is_primary: true },
      ];
      const phones: Phone[] = [
        {
          number: formData.primaryPhone.trim(),
          type: "mobile",
          is_primary: true,
        },
      ];
      const addresses: Address[] = [];
      if (
        formData.addressStreet ||
        formData.addressCity ||
        formData.addressState ||
        formData.addressPostalCode
      ) {
        addresses.push({
          type: "work",
          street: formData.addressStreet.trim(),
          city: formData.addressCity.trim(),
          state: formData.addressState.trim(),
          postal_code: formData.addressPostalCode.trim(),
          country: formData.addressCountry,
          is_primary: true,
        });
      }

      const social_links: SocialLinks = {};
      if (formData.linkedin.trim())
        social_links.linkedin = formData.linkedin.trim();
      if (formData.twitter.trim())
        social_links.twitter = formData.twitter.trim();
      if (formData.website.trim())
        social_links.website = formData.website.trim();

      // Prepare notes - send array with _id for updates or new strings for new notes
      let notesArray: Array<{ _id?: string; note: string } | string> = [];
      if (formData.notes && Array.isArray(formData.notes) && formData.notes.length > 0) {
        notesArray = formData.notes
          .filter(note => note.note && note.note.trim())
          .map(note => {
            // If note has _id, send as object for update
            if (note._id) {
              return { _id: note._id, note: note.note.trim() };
            }
            // Otherwise, send as string for new note
            return note.note.trim();
          });
      }

      const payload: Partial<CreateContactInput & { notes: any }> = {
        name: formData.name.trim(),
        emails,
        phones,
        company: formData.company.trim(),
        categories:
          formData.categories.length > 0 ? formData.categories : ["Other"],
        tags: formData.tags,
        notes: notesArray.length > 0 ? notesArray : undefined,
        status: formData.status,
        leadScore: formData.leadScore
          ? parseInt(formData.leadScore)
          : undefined,
        lastInteraction: formData.lastInteraction
          ? formData.lastInteraction.toISOString()
          : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
        social_links:
          Object.keys(social_links).length > 0 ? social_links : undefined,
      };

      // If there's a new file to upload, use FormData (handled by mutation)
      // Otherwise, include profile_photo in payload if it's a URL
      if (
        !profileImageFile &&
        formData.profileImage &&
        !formData.profileImage.startsWith("data:")
      ) {
        // Existing image URL - include in payload
        if (
          formData.profileImage.startsWith("http") ||
          formData.profileImage.startsWith("/")
        ) {
          payload.profile_photo = formData.profileImage;
        }
      }

      console.log("Updating contact with payload:", {
        id,
        payload,
        hasFile: !!profileImageFile,
      });

      const result = await updateContact({
        id: String(id),
        data: payload,
        profileImageFile: profileImageFile || undefined,
      }).unwrap();

      console.log("Update successful:", result);
      toast.success("Contact updated successfully!");
      navigate(`/contacts/${id}`);
    } catch (error: any) {
      console.error("Error updating contact:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to update contact";
      toast.error(errorMessage);
    }
  };

  const availableCategories = validCategories.filter(
    (cat) => user?.role === "Admin" || hasCategory(cat)
  );

  const displayCategories =
    availableCategories.length > 0
      ? availableCategories
      : user?.role === "Admin"
      ? validCategories
      : ["Other"];

  if (isLoadingContact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground mb-4">
            Loading contact...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!existingContact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground mb-4">
            Contact not found
          </p>
          <Button onClick={() => navigate("/contacts")}>
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
          <p className="text-lg text-muted-foreground mb-4">
            No categories available
          </p>
          <Button onClick={() => navigate("/contacts")}>
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
                      <AvatarImage
                        src={previewImage || undefined}
                        alt={formData.name}
                      />
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
                      {previewImage ? "Change Image" : "Upload Image"}
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() => handleBlur("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      Company <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      onBlur={() => handleBlur("company")}
                      className={errors.company ? "border-destructive" : ""}
                    />
                    {errors.company && (
                      <p className="text-sm text-destructive">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="primaryEmail"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={formData.primaryEmail}
                      onChange={(e) =>
                        handleInputChange("primaryEmail", e.target.value)
                      }
                      className={
                        errors.primaryEmail ? "border-destructive" : ""
                      }
                    />
                    {errors.primaryEmail && (
                      <p className="text-sm text-destructive">
                        {errors.primaryEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="primaryPhone"
                      className="flex items-center gap-2"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="primaryPhone"
                      value={formData.primaryPhone}
                      onChange={(e) =>
                        handleInputChange("primaryPhone", e.target.value)
                      }
                      onBlur={() => handleBlur("primaryPhone")}
                      className={
                        errors.primaryPhone ? "border-destructive" : ""
                      }
                    />
                    {errors.primaryPhone && (
                      <p className="text-sm text-destructive">
                        {errors.primaryPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                    {displayCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
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
                  {errors.categories && (
                    <p className="text-sm text-destructive">
                      {errors.categories}
                    </p>
                  )}
                </div>

                {/* Status and Lead Score */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contactStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="leadScore"
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Lead Score
                    </Label>
                    <Input
                      id="leadScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.leadScore}
                      onChange={(e) =>
                        handleInputChange("leadScore", e.target.value)
                      }
                      onBlur={() => handleBlur("leadScore")}
                    />
                    {errors.leadScore && (
                      <p className="text-sm text-destructive">
                        {errors.leadScore}
                      </p>
                    )}
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
                        {formData.lastInteraction
                          ? format(formData.lastInteraction, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.lastInteraction}
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastInteraction: date,
                          }))
                        }
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
                        onChange={(e) =>
                          handleInputChange("addressStreet", e.target.value)
                        }
                        onBlur={() => handleBlur("addressStreet")}
                      />
                      {errors.addressStreet && (
                        <p className="text-sm text-destructive">
                          {errors.addressStreet}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressCity">City</Label>
                      <Input
                        id="addressCity"
                        value={formData.addressCity}
                        onChange={(e) =>
                          handleInputChange("addressCity", e.target.value)
                        }
                        onBlur={() => handleBlur("addressCity")}
                      />
                      {errors.addressCity && (
                        <p className="text-sm text-destructive">
                          {errors.addressCity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressState">State</Label>
                      <Input
                        id="addressState"
                        value={formData.addressState}
                        onChange={(e) =>
                          handleInputChange("addressState", e.target.value)
                        }
                        onBlur={() => handleBlur("addressState")}
                      />
                      {errors.addressState && (
                        <p className="text-sm text-destructive">
                          {errors.addressState}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressPostalCode">Postal Code</Label>
                      <Input
                        id="addressPostalCode"
                        value={formData.addressPostalCode}
                        onChange={(e) =>
                          handleInputChange("addressPostalCode", e.target.value)
                        }
                        onBlur={() => handleBlur("addressPostalCode")}
                      />
                      {errors.addressPostalCode && (
                        <p className="text-sm text-destructive">
                          {errors.addressPostalCode}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressCountry">Country</Label>
                      <Select
                        value={formData.addressCountry}
                        onValueChange={(value) =>
                          handleInputChange("addressCountry", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
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
                      <Label
                        htmlFor="linkedin"
                        className="flex items-center gap-2"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) =>
                          handleInputChange("linkedin", e.target.value)
                        }
                        onBlur={() => handleBlur("linkedin")}
                      />
                      {errors.linkedin && (
                        <p className="text-sm text-destructive">
                          {errors.linkedin}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="twitter"
                        className="flex items-center gap-2"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) =>
                          handleInputChange("twitter", e.target.value)
                        }
                        onBlur={() => handleBlur("twitter")}
                      />
                      {errors.twitter && (
                        <p className="text-sm text-destructive">
                          {errors.twitter}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="website"
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        onBlur={() => handleBlur("website")}
                      />
                      {errors.website && (
                        <p className="text-sm text-destructive">
                          {errors.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <div className="space-y-3">
                    {formData.notes.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No notes yet. Click "Add New Note" to add one.
                      </div>
                    ) : (
                      formData.notes.map((note, index) => (
                        <div key={note._id || index} className="space-y-2 p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {note._id ? 'Existing Note' : 'New Note'}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedNotes = formData.notes.filter((_, i) => i !== index);
                                setFormData({ ...formData, notes: updatedNotes });
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Textarea
                            value={note.note}
                            onChange={(e) => {
                              const updatedNotes = [...formData.notes];
                              updatedNotes[index] = { ...note, note: e.target.value };
                              setFormData({ ...formData, notes: updatedNotes });
                            }}
                            placeholder="Enter note text..."
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      ))
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes: [...formData.notes, { note: '' }]
                        });
                      }}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Add New Note
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[60px]">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full"
                      >
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
                    {isLoading ? "Updating..." : "Update Contact"}
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
