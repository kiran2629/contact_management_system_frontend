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
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from "@/store/services/contactsApi";
import type { CreateContactInput } from "@/store/services/contactsApi";
import { addContact, updateContact } from "@/store/slices/contactsSlice";
import { useDispatch } from "react-redux";
import { AppLayout } from "@/components/layout/AppLayout";
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

// Zod validation schema
const addContactSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  birthday: z
    .date({
      required_error: "Birthday is required",
      invalid_type_error: "Please select a valid date",
    })
    .refine(
      (date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          return age - 1 >= 14;
        }
        return age >= 14;
      },
      { message: "User must be at least 14 years old" }
    )
    .refine((date) => date <= new Date(), {
      message: "Birthday must be a past date",
    }),
  linkedinUrl: z
    .string()
    .url("Invalid URL")
    .refine((url) => url.startsWith("https://www.linkedin.com/"), {
      message: "LinkedIn URL must start with https://www.linkedin.com/",
    }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(""),
});

type AddContactForm = z.infer<typeof addContactSchema>;

const AddContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContactMutation, { isLoading: isUpdating }] =
    useUpdateContactMutation();

  const isEditMode = !!id;
  const existingContact = isEditMode ? contacts.find((c) => c.id === id) : null;
  const isLoading = isCreating || isUpdating;

  const form = useForm<AddContactForm>({
    resolver: zodResolver(addContactSchema),
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
        birthday: parseISO(existingContact.birthday),
        linkedinUrl: existingContact.linkedinUrl,
        address: existingContact.address,
        tags: existingContact.tags || [],
        notes: existingContact.notes || "",
      });
    }
  }, [existingContact, form]);

  const onSubmit = async (data: AddContactForm) => {
    try {
      // Format birthday as string (YYYY-MM-DD)
      const formattedData: CreateContactInput = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        categories: data.categories,
        birthday: format(data.birthday, "yyyy-MM-dd"),
        linkedinUrl: data.linkedinUrl,
        address: data.address,
        tags: data.tags || [],
        notes: data.notes || "",
      };

      if (isEditMode && id) {
        // Update existing contact
        const result = await updateContactMutation({
          id: Number(id),
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
      toast.error(
        error?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } contact. Please try again.`
      );
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/contacts")}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Contact" : "Add New Contact"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update contact information in your CRM system"
                : "Create a new contact in your CRM system"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Fill in all required fields to add a new contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Two Column Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="transition-all focus:scale-[1.02]"
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                            className="transition-all focus:scale-[1.02]"
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
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="1234567890"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              // Only allow digits
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);
                            }}
                            className="transition-all focus:scale-[1.02]"
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
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Corporation"
                            {...field}
                            className="transition-all focus:scale-[1.02]"
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
                        <FormLabel>
                          Categories <span className="text-destructive">*</span>
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
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Birthday <span className="text-destructive">*</span>
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

                  {/* LinkedIn URL */}
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn URL{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.linkedin.com/in/johndoe"
                            {...field}
                            className="transition-all focus:scale-[1.02]"
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
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main Street, City, State, ZIP"
                            {...field}
                            className="transition-all focus:scale-[1.01] min-h-[80px]"
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

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about this contact..."
                            {...field}
                            className="transition-all focus:scale-[1.01] min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/contacts")}
                    className="w-full sm:w-auto hover:scale-105 transition-transform"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto hover:scale-105 transition-transform"
                  >
                    {isLoading ? (
                      <>
                        <ButtonLoader size={16} />
                        <span className="ml-2">
                          {isEditMode ? "Updating..." : "Saving..."}
                        </span>
                      </>
                    ) : isEditMode ? (
                      "Update Contact"
                    ) : (
                      "Save Contact"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default AddContact;
