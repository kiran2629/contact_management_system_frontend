import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/form/DatePicker";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  Tag,
  Calendar,
  Linkedin,
  FileText,
} from "lucide-react";
import {
  useCreateContactMutation,
  CreateContactInput,
} from "@/store/services/contactsApi";
import { format } from "date-fns";

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

const NewContact = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasCategory, canCreate, canViewBirthdays } = usePermissions();
  const [createContact, { isLoading }] = useCreateContactMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    categories: [] as string[],
    birthday: undefined as Date | undefined,
    linkedinUrl: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

      case "email":
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

      case "phone":
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

      case "birthday":
        if (value) {
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          const monthDiff = today.getMonth() - value.getMonth();
          const actualAge =
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < value.getDate())
              ? age - 1
              : age;

          if (actualAge < 14) {
            return "User must be at least 14 years old";
          }
          if (actualAge > 120) {
            return "Please enter a valid age";
          }
          if (value > today) {
            return "Birthday must be a past date";
          }
        }
        return "";

      case "linkedinUrl":
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

      case "notes":
        if (value && String(value).length > 5000) {
          return "Notes must be less than 5000 characters";
        }
        return "";

      default:
        return "";
    }
  };

  const handleInputChange = (
    field: string,
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Validate field immediately
    const error = validateField(field, value);
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
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const email = formData.email.trim().toLowerCase();
      if (email.length > 255) {
        newErrors.email = "Email must be less than 255 characters";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ) {
        newErrors.email = "Email format is invalid";
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else {
      const phone = formData.phone.trim();
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.phone = "Phone must be between 10 and 15 digits";
      } else if (
        !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
          phone.replace(/\s/g, "")
        )
      ) {
        newErrors.phone = "Please enter a valid phone number";
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

    // Birthday validation (optional)
    if (formData.birthday) {
      const today = new Date();
      const age = today.getFullYear() - formData.birthday.getFullYear();
      const monthDiff = today.getMonth() - formData.birthday.getMonth();
      const actualAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < formData.birthday.getDate())
          ? age - 1
          : age;

      if (actualAge < 14) {
        newErrors.birthday = "User must be at least 14 years old";
      } else if (actualAge > 120) {
        newErrors.birthday = "Please enter a valid age";
      }

      if (formData.birthday > today) {
        newErrors.birthday = "Birthday must be a past date";
      }
    }

    // LinkedIn URL validation (optional)
    if (formData.linkedinUrl && formData.linkedinUrl.trim() !== "") {
      try {
        const url = new URL(formData.linkedinUrl);
        if (
          url.protocol !== "https:" ||
          (url.hostname !== "www.linkedin.com" &&
            url.hostname !== "linkedin.com")
        ) {
          newErrors.linkedinUrl =
            "LinkedIn URL must start with https://www.linkedin.com/ or https://linkedin.com/";
        }
      } catch {
        newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
      }
    }

    // Notes validation (optional)
    if (formData.notes && formData.notes.length > 5000) {
      newErrors.notes = "Notes must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permissions before submission
    if (!canCreate("contact") && user?.role !== "Admin") {
      toast.error("You don't have permission to create contacts");
      navigate("/contacts");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      // Transform data to match backend format
      const payload: CreateContactInput = {
        name: formData.name.trim(),
        emails: [
          { email: formData.email.trim(), type: "work", is_primary: true },
        ],
        phones: [
          { number: formData.phone.trim(), type: "mobile", is_primary: true },
        ],
        company: formData.company.trim(),
        categories:
          formData.categories.length > 0 ? formData.categories : ["Other"],
        social_links: {
          linkedin: formData.linkedinUrl.trim() || undefined,
        },
        notes: formData.notes.trim() || undefined,
        tags: [],
      };

      const result = await createContact(payload).unwrap();

      toast.success("Contact created successfully!");
      navigate(`/contacts/${result.id}`);
    } catch (error: any) {
      console.error("Error creating contact:", error);
      const errorMessage =
        error?.data?.error || error?.message || "Failed to create contact";
      toast.error(errorMessage);
    }
  };

  // Filter categories based on user permissions
  const availableCategories = validCategories.filter(
    (cat) => user?.role === "Admin" || hasCategory(cat)
  );

  // If no categories available, show all for Admin, or at least "Other" for others
  const displayCategories =
    availableCategories.length > 0
      ? availableCategories
      : user?.role === "Admin"
      ? validCategories
      : ["Other"];

  // Ensure we have categories to display
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
            onClick={() => navigate("/contacts")}
            className="border-2 border-border/50 hover:border-primary transition-all hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
            {/* Gradient header background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />

            <CardHeader className="border-b-2 border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5 pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Add New Contact
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Fill in the details to create a new contact
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter contact name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`h-12 text-base border-2 ${
                      errors.name
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`h-12 text-base border-2 ${
                      errors.email
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`h-12 text-base border-2 ${
                      errors.phone
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Company Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    onBlur={() => handleBlur("company")}
                    className={`h-12 text-base border-2 ${
                      errors.company
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>

                {/* Categories Field */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Categories <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg border-2 border-border/50 bg-muted/30">
                    {displayCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                          className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
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

                {/* Birthday Field */}
                {canViewBirthdays() && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Birthday
                    </Label>
                    <DatePicker
                      date={formData.birthday}
                      onDateChange={(date) => {
                        handleInputChange("birthday", date);
                        if (date) handleBlur("birthday");
                      }}
                      placeholder="Select birthday"
                      maxDate={new Date()}
                    />
                    {errors.birthday && (
                      <p className="text-sm text-destructive">
                        {errors.birthday}
                      </p>
                    )}
                  </div>
                )}

                {/* LinkedIn URL Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedinUrl"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4 text-primary" />
                    LinkedIn Profile <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://www.linkedin.com/in/johndoe"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      handleInputChange("linkedinUrl", e.target.value)
                    }
                    onBlur={() => handleBlur("linkedinUrl")}
                    className={`h-12 text-base border-2 ${
                      errors.linkedinUrl
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-sm text-destructive">
                      {errors.linkedinUrl}
                    </p>
                  )}
                </div>

                {/* Notes Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this contact..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    onBlur={() => handleBlur("notes")}
                    className={`min-h-[120px] text-base border-2 ${
                      errors.notes
                        ? "border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">{errors.notes}</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/contacts")}
                    className="flex-1 border-2 border-border/50 hover:border-primary transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 border-2 border-primary/30 hover:border-primary transition-all shadow-lg hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Contact
                      </>
                    )}
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

export default NewContact;
