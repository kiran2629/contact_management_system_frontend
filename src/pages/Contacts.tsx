import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/ai-features/localization/useTranslation";
import {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Linkedin,
  Edit,
  Trash,
  X,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Filter,
  User,
  Upload,
  FileSpreadsheet,
  Briefcase,
  Twitter,
  Globe,
  Tag,
  Star,
  Clock,
  FileText,
  Bot,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// All available categories
const ALL_CATEGORIES = [
  "Public",
  "HR",
  "Employee",
  "Candidate",
  "Client",
  "Partner",
  "Vendor",
  "Other",
];

const Contacts = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    canAccess,
    hasCategory,
    canView,
    canImportContacts,
    canViewBirthdays,
  } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(id || null);
  const [showRelatedOnly, setShowRelatedOnly] = useState(false);
  const [aiProfile, setAiProfile] = useState<any>(null);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useGetContactsQuery();
  const { data: selectedContact } = useGetContactByIdQuery(selectedId || "0", {
    skip: !selectedId,
  });

  // Extract and normalize contact data similar to ContactDetails/EditContact
  const contactData = useMemo(() => {
    if (!selectedContact) return null;

    // Extract primary email - handle both array format and direct email field
    let primaryEmail = "";
    if (
      selectedContact.emails &&
      Array.isArray(selectedContact.emails) &&
      selectedContact.emails.length > 0
    ) {
      primaryEmail =
        selectedContact.emails.find((e: any) => e.is_primary)?.email ||
        selectedContact.emails[0]?.email ||
        "";
    } else if (selectedContact.email) {
      primaryEmail = selectedContact.email;
    }

    // Extract primary phone - handle both array format and direct phone field
    let primaryPhone = "";
    if (
      selectedContact.phones &&
      Array.isArray(selectedContact.phones) &&
      selectedContact.phones.length > 0
    ) {
      primaryPhone =
        selectedContact.phones.find((p: any) => p.is_primary)?.number ||
        selectedContact.phones[0]?.number ||
        "";
    } else if (selectedContact.phone) {
      primaryPhone = selectedContact.phone;
    }

    // Extract primary address
    const primaryAddress =
      selectedContact.addresses &&
      Array.isArray(selectedContact.addresses) &&
      selectedContact.addresses.length > 0
        ? selectedContact.addresses.find((a: any) => a.is_primary) ||
          selectedContact.addresses[0]
        : null;

    let address = "";
    if (primaryAddress) {
      address = `${primaryAddress.street || ""}, ${
        primaryAddress.city || ""
      }, ${primaryAddress.state || ""} ${
        primaryAddress.postal_code || ""
      }`.trim();
    } else if (selectedContact.address) {
      address = selectedContact.address;
    }

    // Extract LinkedIn URL - can be from social_links or direct linkedinUrl field
    const linkedinUrl =
      selectedContact.social_links?.linkedin ||
      selectedContact.linkedinUrl ||
      "";

    // Extract notes - prioritize contactNotes array
    const notes =
      Array.isArray(selectedContact.contactNotes) &&
      selectedContact.contactNotes.length > 0
        ? selectedContact.contactNotes
        : selectedContact.notes
        ? Array.isArray(selectedContact.notes)
          ? selectedContact.notes.map((n: any) =>
              typeof n === "string"
                ? { note: n }
                : {
                    _id: n._id,
                    note: n.note || n.content || n.text || "",
                    userId: n.userId || { userName: "Unknown" },
                    sentiment: n.sentiment || "neutral",
                    createdAt:
                      n.createdAt || n.created_at || new Date().toISOString(),
                    updatedAt:
                      n.updatedAt ||
                      n.updated_at ||
                      n.createdAt ||
                      n.created_at ||
                      new Date().toISOString(),
                  }
            )
          : [{ note: String(selectedContact.notes) }]
        : [];

    return {
      ...selectedContact,
      email: primaryEmail || selectedContact.email || "",
      phone: primaryPhone || selectedContact.phone || "",
      address: address || selectedContact.address || "",
      linkedinUrl: linkedinUrl || selectedContact.linkedinUrl || "",
      contactNotes: notes,
      // Include all other fields from contact
      status: selectedContact.status,
      leadScore: selectedContact.leadScore,
      lastInteraction: selectedContact.lastInteraction,
      position: selectedContact.position,
      birthday: selectedContact.birthday,
      twitter: selectedContact.social_links?.twitter || "",
      website: selectedContact.social_links?.website || "",
    };
  }, [selectedContact]);

  // Reset AI profile when contact changes
  useEffect(() => {
    setAiProfile(null);
  }, [selectedId]);

  // Fetch AI Profile Summary
  const handleFetchAiSummary = async () => {
    if (!contactData) return;

    setIsLoadingAiSummary(true);
    setAiProfile(null);

    try {
      // Prepare payload according to API requirements
      const payload = {
        name: contactData.name || "",
        email: contactData.email || "",
        phone: contactData.phone || "",
        company: contactData.company || "",
        categories: contactData.categories || [],
        birthday: contactData.birthday
          ? new Date(contactData.birthday).toISOString().split("T")[0]
          : undefined,
        linkedin: contactData.linkedinUrl || "",
        address: contactData.address || "",
      };

      const response = await fetch(
        "https://crmpythonapi.onrender.com/contacts/ai-profile-summary/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Handle the response structure: { status: "success", ai_profile: {...} }
        if (result.ai_profile) {
          setAiProfile(result.ai_profile);
        } else if (result.summary || result.profile_summary) {
          // Fallback for different response formats
          setAiProfile({
            summary:
              result.summary ||
              result.profile_summary ||
              result.data ||
              result.message ||
              "",
          });
        } else {
          toast.info("AI profile generated but no content returned");
        }
      } else {
        toast.error(
          result.message || result.error || "Failed to generate AI profile"
        );
      }
    } catch (error: any) {
      console.error("AI profile error:", error);
      toast.error("Failed to generate AI profile. Please try again.");
    } finally {
      setIsLoadingAiSummary(false);
    }
  };

  const [deleteContactMutation, { isLoading: isDeleting }] =
    useDeleteContactMutation();

  // Update selectedId when URL param changes or on mount
  useEffect(() => {
    if (id) {
      setSelectedId(id);
      setShowRelatedOnly(true); // Automatically show related contacts when contact is selected via URL
    } else {
      // Reset when navigating to /contacts without an id (e.g., from Dashboard)
      // This ensures the contact list is visible
      setSelectedId(null);
      setShowRelatedOnly(false);
    }
  }, [id]);

  // Enhanced search function that searches across multiple fields
  const searchInContact = useCallback(
    (contact: any, query: string): boolean => {
      if (!query || query.trim() === "") return true;

      const searchTerm = query.toLowerCase().trim();

      // Search in name
      if (contact.name?.toLowerCase().includes(searchTerm)) return true;

      // Search in company
      if (contact.company?.toLowerCase().includes(searchTerm)) return true;

      // Search in email
      if (contact.email?.toLowerCase().includes(searchTerm)) return true;

      // Search in phone
      if (contact.phone?.toLowerCase().includes(searchTerm)) return true;

      // Search in position
      if (contact.position?.toLowerCase().includes(searchTerm)) return true;

      // Search in address
      if (contact.address?.toLowerCase().includes(searchTerm)) return true;

      // Search in LinkedIn URL
      if (contact.linkedinUrl?.toLowerCase().includes(searchTerm)) return true;

      // Search in tags
      if (
        contact.tags?.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm)
        )
      )
        return true;

      // Search in categories
      if (
        contact.categories?.some((cat: string) =>
          cat.toLowerCase().includes(searchTerm)
        )
      )
        return true;

      // Search in notes
      if (contact.notes?.toLowerCase().includes(searchTerm)) return true;

      // Search in all emails array
      if (
        contact.emails?.some((e: any) =>
          e.email?.toLowerCase().includes(searchTerm)
        )
      )
        return true;

      // Search in all phones array
      if (
        contact.phones?.some((p: any) =>
          p.number?.toLowerCase().includes(searchTerm)
        )
      )
        return true;

      return false;
    },
    []
  );

  const filteredContacts = useMemo(() => {
    // If user is Admin, show all contacts (backend already filters for non-Admins)
    const isAdmin = user?.role === "Admin";

    return contacts.filter((contact) => {
      // Admin can see all contacts, others need category permission check
      // Case-insensitive comparison for categories
      const hasAllowedCategory =
        isAdmin ||
        contact.categories.some((cat) => {
          const userCategories = user?.allowed_categories || [];
          return userCategories.some(
            (allowedCat) => allowedCat.toLowerCase() === cat.toLowerCase()
          );
        });

      // Enhanced search across multiple fields - use searchQuery directly for real-time filtering
      const matchesSearch = searchInContact(contact, searchQuery);

      // Filter by selected category (if any is selected) - case-insensitive comparison
      const matchesCategory =
        !selectedCategory ||
        contact.categories.some(
          (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
        );

      // Filter by related contacts if a contact is selected and showRelatedOnly is true
      let matchesRelated = true;
      if (showRelatedOnly && selectedContact && selectedId) {
        // Show related contacts: same company OR shared categories
        const sameCompany = contact.company?.toLowerCase() === selectedContact.company?.toLowerCase();
        const sharedCategories = contact.categories.some((cat) =>
          selectedContact.categories.includes(cat)
        );
        // Exclude the selected contact itself
        const isNotSelected = String(contact.id) !== String(selectedId);
        matchesRelated = isNotSelected && (sameCompany || sharedCategories);
      }

      return hasAllowedCategory && matchesSearch && matchesCategory && matchesRelated;
    });
  }, [contacts, searchQuery, selectedCategory, hasCategory, user?.role, searchInContact]);

  const handleDelete = async () => {
    if (!selectedContact || !selectedId) return;

    try {
      await deleteContactMutation(String(selectedId)).unwrap();
      toast.success("Contact deleted successfully");
      setSelectedId(null);
    } catch (error: any) {
      toast.error("Failed to delete contact");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: string) => {
    // If clicking the same category, deselect it
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleCsvImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      toast.error("Please select a valid CSV file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://crmpythonapi.onrender.com/contacts/upload_valid_data/",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Contacts imported successfully!");
        // Refetch contacts to show newly imported ones
        refetch();
      } else {
        toast.error(
          result.message || result.error || "Failed to import contacts"
        );
      }
    } catch (error: any) {
      console.error("CSV import error:", error);
      toast.error("Failed to import contacts. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedCategory !== null;

  // Check if user has permission to view contacts
  const canViewContacts = canView("contact") || user?.role === "Admin";

  // If user doesn't have read permission, show access denied message
  if (!canViewContacts) {
    return (
      <LayoutRouter>
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              You don't have permission to view contacts.
            </p>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  return (
    <LayoutRouter>
      <div className="h-[calc(100vh-140px)] w-full">
        <div className="glass-card rounded-xl border border-border/20 overflow-hidden h-full flex flex-col md:flex-row">
          {/* LEFT: Contacts List */}
          <div
            className={`${selectedId ? "hidden md:flex" : "flex"} ${
              selectedId ? "md:w-1/2" : "w-full"
            } border-r border-border/20 flex-col transition-all duration-300 overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/10 bg-gradient-to-br from-primary/3 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gradient-shine">
                    {showRelatedOnly && selectedContact ? "Related Contacts" : "Contacts"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {filteredContacts.length} of {contacts.length} contacts
                    {showRelatedOnly && selectedContact && (
                      <span className="ml-1 text-primary">(related to {selectedContact.name})</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedId && selectedContact && (
                    <Button
                      variant={showRelatedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowRelatedOnly(!showRelatedOnly)}
                      className="rounded-lg"
                    >
                      <User className="w-4 h-4 mr-1" />
                      {showRelatedOnly ? "All Contacts" : "Related Only"}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Filter className="w-4 h-4 mr-1" />
                        {selectedCategory ? selectedCategory : "Filter"}
                        {selectedCategory && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-4 px-1 text-[10px]"
                          >
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory(null)}
                        className={!selectedCategory ? "bg-accent" : ""}
                      >
                        All Categories
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {ALL_CATEGORIES.map((category) => (
                        <DropdownMenuItem
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={
                            selectedCategory === category
                              ? "bg-accent font-medium"
                              : ""
                          }
                        >
                          {category}
                          {selectedCategory === category && (
                            <span className="ml-auto text-primary">✓</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                      {selectedCategory && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleClearFilters}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Filter
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Only show Import CSV button if user has import_contacts permission */}
                  {user?.permissions && canImportContacts() && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCsvImport}
                        disabled={isUploading}
                        className="rounded-lg"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-1" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Import CSV
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {canAccess("contact", "create") && (
                    <Link to="/contacts/new">
                      <Button
                        size="sm"
                        className="rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Contact
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Simple Search Input - Filters contact cards directly */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  placeholder={t("search_contacts")}
                  className="pl-9 pr-10 h-9 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Search Results Info */}
              {searchQuery.trim().length >= 1 && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Search className="h-3 w-3" />
                  <span>
                    Found{" "}
                    <span className="font-semibold text-foreground">
                      {filteredContacts.length}
                    </span>{" "}
                    {filteredContacts.length === 1 ? "contact" : "contacts"}
                    {filteredContacts.length !== contacts.length && (
                      <span className="ml-1 text-primary">
                        matching "{searchQuery}"
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Active Filter Badge */}
              {selectedCategory && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Category: {selectedCategory}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="h-5 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredContacts.length > 0 ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${
                        selectedId === String(contact.id)
                          ? "border-primary/50 bg-card/50 shadow-md"
                          : "border-border/30 bg-card hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      {/* Card Content */}
                      <div className="flex flex-col gap-3">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-primary/30 shrink-0">
                            {contact.profile_photo ? (
                              <AvatarImage 
                                src={contact.profile_photo.startsWith('http') 
                                  ? contact.profile_photo 
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${contact.profile_photo}`} 
                                alt={contact.name}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base truncate">
                              {contact.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.company}
                            </p>
                          </div>
                        </div>

                          {/* Email & Phone */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{contact.phone}</span>
                            </div>
                          </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1">
                          {contact.categories.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 h-5"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {contact.categories.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">
                              +{contact.categories.length - 3}
                            </Badge>
                          )}
                        </div>

                          {/* View Button */}
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(String(contact.id));
                              setShowRelatedOnly(true); // Automatically show related contacts
                            }}
                            className="w-full mt-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("no_contacts_found")}
            </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Contact Details */}
          <AnimatePresence mode="wait">
            {selectedId && selectedContact ? (
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`${
                  selectedId ? "flex" : "hidden"
                } md:flex md:w-1/2 flex-col`}
              >
                {/* Header */}
                <div className="p-3 border-b border-border/10 bg-gradient-to-br from-secondary/3 to-transparent">
                  <div className="flex items-start justify-between mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedId(null);
                        setShowRelatedOnly(false);
                      }}
                      className="md:hidden h-7"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Back
                    </Button>

                    <div className="flex-1" />

                    <div className="flex gap-1.5">
                      {canAccess("contact", "update") && (
                        <Link to={`/contacts/${selectedId}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      {canAccess("contact", "delete") && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="h-7 px-2"
                        >
                          <Trash className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedId(null);
                          setShowRelatedOnly(false);
                        }}
                        className="hidden md:flex h-7 w-7 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/30 shrink-0">
                      {contactData.profile_photo ? (
                        <AvatarImage
                          src={
                            contactData.profile_photo.startsWith("http")
                              ? contactData.profile_photo
                              : `${
                                  import.meta.env.VITE_API_URL ||
                                  "http://localhost:5000"
                                }${contactData.profile_photo}`
                          }
                          alt={contactData.name}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold text-primary">
                        {contactData.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-foreground mb-0.5 truncate">
                        {contactData.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mb-1.5 truncate">
                        {contactData.position
                          ? `${contactData.position} at `
                          : ""}
                        {contactData.company}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(contactData.categories || []).map((cat) => (
                          <Badge
                            key={cat}
                            className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border border-primary/30"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid md:grid-cols-2 gap-2 max-w-4xl">
                    {contactData.email && (
                      <a
                        href={`mailto:${contactData.email}`}
                        className="flex items-center gap-2 p-2 rounded-md border border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Email
                          </p>
                          <p className="font-medium text-xs truncate">
                            {contactData.email}
                          </p>
                        </div>
                      </a>
                    )}

                    {contactData.phone && (
                      <a
                        href={`tel:${contactData.phone}`}
                        className="flex items-center gap-2 p-2 rounded-md border border-border/20 hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                      >
                        <div className="w-8 h-8 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Phone
                          </p>
                          <p className="font-medium text-xs truncate">
                            {contactData.phone}
                          </p>
                        </div>
                      </a>
                    )}

                    {contactData.company && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Company
                          </p>
                          <p className="font-medium text-xs truncate">
                            {contactData.company}
                          </p>
                        </div>
                      </div>
                    )}

                    {contactData.position && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Position
                          </p>
                          <p className="font-medium text-xs truncate">
                            {contactData.position}
                          </p>
                        </div>
                      </div>
                    )}

                    {contactData.address && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Address
                          </p>
                          <p className="font-medium text-xs truncate">
                            {contactData.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {contactData.linkedinUrl && (
                      <a
                        href={contactData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border border-border/20 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Linkedin className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            LinkedIn
                          </p>
                          <p className="font-medium text-xs text-blue-500 truncate">
                            {contactData.linkedinUrl}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      </a>
                    )}

                    {contactData.twitter && (
                      <a
                        href={
                          contactData.twitter.startsWith("http")
                            ? contactData.twitter
                            : `https://twitter.com/${contactData.twitter.replace(
                                "@",
                                ""
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border border-border/20 hover:border-blue-400/30 hover:bg-blue-400/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-md bg-blue-400/10 flex items-center justify-center shrink-0">
                          <Twitter className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Twitter
                          </p>
                          <p className="font-medium text-xs text-blue-400 truncate">
                            {contactData.twitter}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      </a>
                    )}

                    {contactData.website && (
                      <a
                        href={
                          contactData.website.startsWith("http")
                            ? contactData.website
                            : `https://${contactData.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border border-border/20 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Website
                          </p>
                          <p className="font-medium text-xs text-purple-500 truncate">
                            {contactData.website}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      </a>
                    )}

                    {contactData.status && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Status
                          </p>
                          <p className="font-medium text-xs truncate capitalize">
                            {contactData.status}
                          </p>
                        </div>
                      </div>
                    )}

                    {contactData.leadScore !== null &&
                      contactData.leadScore !== undefined && (
                        <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                          <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                              Lead Score
                            </p>
                            <p className="font-medium text-xs truncate">
                              {contactData.leadScore}
                            </p>
                          </div>
                        </div>
                      )}

                    {contactData.lastInteraction && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Last Interaction
                          </p>
                          <p className="font-medium text-xs truncate">
                            {new Date(
                              contactData.lastInteraction
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {contactData.birthday && canViewBirthdays() && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-pink-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Birthday
                          </p>
                          <p className="font-medium text-xs truncate">
                            {new Date(contactData.birthday).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Profile Summary Section */}
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                          <Bot className="w-4 h-4 text-purple-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          AI Profile Summary
                        </h3>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleFetchAiSummary}
                        disabled={isLoadingAiSummary}
                        className="h-7 px-3 text-xs"
                      >
                        {isLoadingAiSummary ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                    {aiProfile ? (
                      <div className="space-y-3">
                        {/* Summary */}
                        {aiProfile.summary && (
                          <div className="p-3 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent">
                            <p className="text-xs font-semibold text-purple-500 mb-1.5">
                              Summary
                            </p>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                              {aiProfile.summary}
                            </p>
                          </div>
                        )}

                        {/* Key Information Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {aiProfile.seniority_estimate && (
                            <div className="p-2 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                Seniority
                              </p>
                              <p className="text-xs font-semibold text-foreground">
                                {aiProfile.seniority_estimate}
                              </p>
                            </div>
                          )}

                          {aiProfile.communication_style && (
                            <div className="p-2 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                Communication
                              </p>
                              <p className="text-xs font-semibold text-foreground">
                                {aiProfile.communication_style}
                              </p>
                            </div>
                          )}

                          {aiProfile.online_presence_strength && (
                            <div className="p-2 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                Online Presence
                              </p>
                              <p className="text-xs font-semibold text-foreground">
                                {aiProfile.online_presence_strength}
                              </p>
                            </div>
                          )}

                          {aiProfile.confidence !== undefined && (
                            <div className="p-2 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                Confidence
                              </p>
                              <p className="text-xs font-semibold text-foreground">
                                {aiProfile.confidence}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {aiProfile.skills_inferred &&
                          aiProfile.skills_inferred.length > 0 && (
                            <div className="p-2.5 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                                Skills Inferred
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {aiProfile.skills_inferred.map(
                                  (skill: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-500 border-blue-500/30"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Industry Domain */}
                        {aiProfile.industry_domain &&
                          aiProfile.industry_domain.length > 0 && (
                            <div className="p-2.5 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                                Industry Domain
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {aiProfile.industry_domain.map(
                                  (domain: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[9px] px-1.5 py-0 h-4 bg-green-500/10 text-green-500 border-green-500/30"
                                    >
                                      {domain}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Likely Interests */}
                        {aiProfile.likely_interests &&
                          aiProfile.likely_interests.length > 0 && (
                            <div className="p-2.5 rounded-md border border-border/20 bg-muted/30">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                                Likely Interests
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {aiProfile.likely_interests.map(
                                  (interest: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[9px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500 border-purple-500/30"
                                    >
                                      {interest}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Opportunities */}
                        {aiProfile.opportunities &&
                          aiProfile.opportunities.length > 0 && (
                            <div className="p-2.5 rounded-md border border-green-500/20 bg-green-500/5">
                              <p className="text-[9px] font-bold text-green-500 uppercase tracking-wide mb-2">
                                Opportunities
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {aiProfile.opportunities.map(
                                  (opp: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[9px] px-1.5 py-0 h-4 bg-green-500/10 text-green-500 border-green-500/30"
                                    >
                                      {opp}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Risks */}
                        {aiProfile.risks && aiProfile.risks.length > 0 && (
                          <div className="p-2.5 rounded-md border border-red-500/20 bg-red-500/5">
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-wide mb-2">
                              Risks
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {aiProfile.risks.map(
                                (risk: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0 h-4 bg-red-500/10 text-red-500 border-red-500/30"
                                  >
                                    {risk}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-dashed border-border/30 bg-muted/20 text-center">
                        <Bot className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-muted-foreground">
                          Click "Generate" to create an AI-powered profile
                          summary
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  {contactData.contactNotes &&
                    contactData.contactNotes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/20">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Notes
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {contactData.contactNotes.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {contactData.contactNotes.map(
                            (note: any, index: number) => (
                              <div
                                key={note._id || `note-${index}`}
                                className="p-2.5 rounded-md border border-border/20 bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                      <span className="text-[10px] font-bold text-primary">
                                        {note.userId?.userName
                                          ?.charAt(0)
                                          ?.toUpperCase() || "U"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-foreground">
                                      {note.userId?.userName || "Unknown User"}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(
                                        note.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {note.sentiment && (
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] px-1.5 py-0 h-4 ${
                                        note.sentiment === "positive"
                                          ? "border-green-500/30 text-green-500 bg-green-500/10"
                                          : note.sentiment === "negative"
                                          ? "border-red-500/30 text-red-500 bg-red-500/10"
                                          : "border-muted-foreground/30"
                                      }`}
                                    >
                                      {note.sentiment}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                  {note.note || note.content || note.text || ""}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            ) : (
              !selectedId && (
                <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
                  <div className="text-center max-w-xs">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-primary/60" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Select a contact
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Choose from the list to view details
                    </p>
                  </div>
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutRouter>
  );
};

export default Contacts;
