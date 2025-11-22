import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import * as z from "zod";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from "@/store/services/contactsApi";
import type { CreateContactInput } from "@/store/services/contactsApi";
import { addContact, updateContact } from "@/store/slices/contactsSlice";
import { useDispatch } from "react-redux";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/form/MultiSelect";
import { DatePicker } from "@/components/form/DatePicker";
import { TagInput } from "@/components/form/TagInput";
import { ButtonLoader } from "@/components/loaders/ButtonLoader";
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Linkedin,
  MapPin,
  ArrowLeft,
  Tags,
  Save,
  Sparkles,
  Edit3,
  FileText,
} from "lucide-react";

// Categories list
const CATEGORIES = [
  "Public",
  "HR",
  "Employee",
  "Candidate",
  "Client",
  "Partner",
  "Vendor",
  "Other",
];

// Zod validation schema with comprehensive field validations
const addContactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => val.trim().length >= 2, {
      message: "Name cannot be only whitespace",
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .refine(
      (email) => {
        // Additional email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      { message: "Invalid email format" }
    ),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine(
      (phone) => {
        // Remove all non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, "");
        // Allow 10-15 digits (international format)
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      },
      { message: "Phone must be between 10 and 15 digits" }
    )
    .refine(
      (phone) => {
        // Check for valid phone format (allows +, spaces, dashes, parentheses)
        const phoneRegex =
          /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ""));
      },
      { message: "Please enter a valid phone number" }
    ),
  company: z
    .string()
    .min(1, "Company is required")
    .min(2, "Company must be at least 2 characters")
    .max(200, "Company must be less than 200 characters")
    .refine((val) => val.trim().length >= 2, {
      message: "Company cannot be only whitespace",
    }),
  categories: z
    .array(z.string())
    .min(1, "Please select at least one category")
    .refine((categories) => categories.length > 0, {
      message: "At least one category is required",
    }),
  birthday: z
    .date({
      invalid_type_error: "Please select a valid date",
    })
    .optional()
    .refine(
      (date) => {
        if (!date) return true; // Optional field
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        const actualAge =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
            ? age - 1
            : age;
        return actualAge >= 14 && actualAge <= 120;
      },
      { message: "Birthday must represent an age between 14 and 120 years" }
    )
    .refine(
      (date) => {
        if (!date) return true;
        return date <= new Date();
      },
      { message: "Birthday must be a past date" }
    ),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (url) => {
        if (!url || url.trim() === "") return true; // Optional field
        try {
          const urlObj = new URL(url);
          return (
            urlObj.protocol === "https:" &&
            (urlObj.hostname === "www.linkedin.com" ||
              urlObj.hostname === "linkedin.com")
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "LinkedIn URL must be a valid URL starting with https://www.linkedin.com/ or https://linkedin.com/",
      }
    ),
  address: z
    .string()
    .optional()
    .refine(
      (address) => {
        if (!address || address.trim() === "") return true; // Optional field
        return address.trim().length >= 5;
      },
      { message: "Address must be at least 5 characters if provided" }
    )
    .refine(
      (address) => {
        if (!address || address.trim() === "") return true;
        return address.length <= 500;
      },
      { message: "Address must be less than 500 characters" }
    ),
  tags: z.array(z.string()).optional().default([]),
  notes: z
    .string()
    .optional()
    .default("")
    .refine(
      (notes) => {
        if (!notes) return true;
        return notes.length <= 5000;
      },
      { message: "Notes must be less than 5000 characters" }
    ),
});

type AddContactForm = z.infer<typeof addContactSchema>;

const AddContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { canAccess, canCreate, canViewBirthdays } = usePermissions();
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContactMutation, { isLoading: isUpdating }] =
    useUpdateContactMutation();

  const isEditMode = !!id;
  const existingContact = isEditMode ? contacts.find((c) => c.id === id) : null;
  const isLoading = isCreating || isUpdating;

  const form = useForm<AddContactForm>({
    resolver: zodResolver(addContactSchema),
    mode: "onBlur", // Validate on blur for inline errors
    reValidateMode: "onBlur", // Re-validate on blur after first submission
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      categories: [],
      birthday: undefined,
      linkedinUrl: "",
      address: "",
      tags: [],
      notes: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingContact) {
      form.reset({
        name: existingContact.name,
        email: existingContact.email,
        phone: existingContact.phone,
        company: existingContact.company,
        categories: existingContact.categories,
        birthday: existingContact.birthday
          ? parseISO(existingContact.birthday)
          : undefined,
        linkedinUrl: existingContact.linkedinUrl || "",
        address: existingContact.address || "",
        tags: existingContact.tags || [],
        notes: existingContact.notes || "",
      });
    }
  }, [existingContact, form]);

  const onSubmit = async (data: AddContactForm) => {
    // Check permissions before submission
    if (isEditMode) {
      // Check update permission for edit mode
      if (!canAccess("contact", "update") && user?.role !== "Admin") {
        toast.error("You don't have permission to update contacts");
        navigate("/contacts");
        return;
      }
    } else {
      // Check create permission for new contact
      if (!canCreate("contact") && user?.role !== "Admin") {
        toast.error("You don't have permission to create contacts");
        navigate("/contacts");
        return;
      }
    }

    try {
      // Transform data to match backend format
      const formattedData: CreateContactInput = {
        name: data.name,
        emails: [{ email: data.email, type: "work", is_primary: true }],
        phones: [{ number: data.phone, type: "mobile", is_primary: true }],
        company: data.company,
        categories: data.categories,
        tags: data.tags || [],
        notes: data.notes || "",
        social_links: {
          linkedin: data.linkedinUrl || undefined,
        },
      };

      // Add address if provided
      if (data.address) {
        // Parse address string into components (simple parsing)
        const addressParts = data.address.split(",").map((part) => part.trim());
        formattedData.addresses = [
          {
            type: "work",
            street: addressParts[0] || "",
            city: addressParts[1] || "",
            state: addressParts[2] || "",
            postal_code: addressParts[3] || "",
            country: "USA",
            is_primary: true,
          },
        ];
      }

      if (isEditMode && id) {
        // Update existing contact
        const result = await updateContactMutation({
          id: String(id),
          data: formattedData,
        }).unwrap();

        // Also update Redux store for immediate UI update
        if (result) {
          dispatch(updateContact({ ...result, id: String(result.id) } as any));
        }

        toast.success("Contact updated successfully!");
      } else {
        // Create new contact
        const result = await createContact(formattedData).unwrap();

        // Also update Redux store for immediate UI update
        if (result) {
          dispatch(addContact({ ...result, id: String(result.id) } as any));
        }

        toast.success("Contact created successfully!");
      }

      navigate("/contacts");
    } catch (error: any) {
      console.error("Contact operation error:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } contact. Please try again.`
      );
    }
  };

  return (
    <LayoutRouter>
      <div className="space-y-6 w-full">
        {/* 🎨 Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/contacts")}
              className="glass-card w-14 h-14 rounded-xl border-2 border-border/30 hover:border-primary transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </motion.div>

          <div className="flex items-center gap-4 flex-1">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                {isEditMode ? (
                  <Edit3 className="w-8 h-8 text-white" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white" />
                )}
              </div>
            </motion.div>

            <div>
              <h1 className="text-4xl font-black text-gradient-shine">
                {isEditMode ? "Edit Contact" : "Create New Contact"}
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-1">
                {isEditMode
                  ? "Update contact information in your CRM"
                  : "Add a new contact to your professional network"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 📝 Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

          <Card className="glass-card shadow-2xl border-2 border-border/30 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-border/20 pb-6 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription className="text-base">
                Fill in all required fields marked with{" "}
                <span className="text-destructive font-bold">*</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Two Column Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="glass-card border-2 border-border/30 focus:border-primary transition-all py-6 text-base font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-secondary" />
                            </div>
                            Email <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              {...field}
                              className="glass-card border-2 border-border/30 focus:border-secondary transition-all py-6 text-base font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Phone className="h-4 w-4 text-accent" />
                            </div>
                            Phone <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="1234567890"
                              maxLength={10}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                              className="glass-card border-2 border-border/30 focus:border-accent transition-all py-6 text-base font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Company */}
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            Company <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Corporation"
                              {...field}
                              className="glass-card border-2 border-border/30 focus:border-primary transition-all py-6 text-base font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Categories */}
                    <FormField
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <Tags className="h-4 w-4 text-secondary" />
                            </div>
                            Categories{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Controller
                              control={form.control}
                              name="categories"
                              render={({ field: { value, onChange } }) => (
                                <MultiSelect
                                  options={CATEGORIES}
                                  selected={value}
                                  onChange={onChange}
                                  placeholder="Select categories..."
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Birthday */}
                    {canViewBirthdays() && (
                      <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-bold text-base">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-accent" />
                              </div>
                              Birthday
                            </FormLabel>
                            <FormControl>
                              <Controller
                                control={form.control}
                                name="birthday"
                                render={({ field: { value, onChange } }) => (
                                  <DatePicker
                                    date={value}
                                    onDateChange={onChange}
                                    placeholder="Select birthday"
                                    maxDate={new Date()}
                                  />
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* LinkedIn URL */}
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Linkedin className="h-4 w-4 text-blue-500" />
                            </div>
                            LinkedIn URL{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.linkedin.com/in/johndoe"
                              {...field}
                              className="glass-card border-2 border-border/30 focus:border-blue-500 transition-all py-6 text-base font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-secondary" />
                            </div>
                            Address <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Main Street, City, State, ZIP"
                              {...field}
                              className="glass-card border-2 border-border/30 focus:border-secondary transition-all min-h-[100px] text-base font-medium resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <Tags className="h-4 w-4" />
                            Tags
                          </FormLabel>
                          <FormControl>
                            <Controller
                              control={form.control}
                              name="tags"
                              render={({ field: { value, onChange } }) => (
                                <TagInput
                                  tags={value || []}
                                  onChange={onChange}
                                  placeholder="Type and press Enter to add tags"
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:justify-end border-t-2 border-border/20">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/contacts")}
                        className="w-full sm:w-auto glass-card border-2 px-8 py-6 text-base font-semibold rounded-xl"
                      >
                        Cancel
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:shadow-xl border-0 relative overflow-hidden group"
                      >
                        {/* Shimmer effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />

                        {isLoading ? (
                          <>
                            <ButtonLoader size={20} />
                            <span className="ml-2">
                              {isEditMode ? "Updating..." : "Saving..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" />
                            {isEditMode ? "Update Contact" : "Save Contact"}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LayoutRouter>
  );
};

export default AddContact;
