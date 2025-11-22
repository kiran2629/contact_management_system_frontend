import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/form/MultiSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";

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
  const { id } = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const { canAccess, hasCategory } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(id || null);

  const { data: contacts = [], isLoading, error } = useGetContactsQuery();
  const { data: selectedContact } = useGetContactByIdQuery(
    selectedId || '',
    {
      skip: !selectedId,
    }
  );
  const [deleteContactMutation, { isLoading: isDeleting }] =
    useDeleteContactMutation();

  const filteredContacts = useMemo(() => {
    // If user is Admin, show all contacts (backend already filters for non-Admins)
    const isAdmin = user?.role === "Admin";
    
    return contacts.filter((contact) => {
      // Admin can see all contacts, others need category permission check
      const hasAllowedCategory = isAdmin || contact.categories.some((cat) =>
        hasCategory(cat)
      );
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected categories (if any are selected)
      const matchesCategory =
        selectedCategories.length === 0 ||
        contact.categories.some((cat) => selectedCategories.includes(cat));

      return hasAllowedCategory && matchesSearch && matchesCategory;
    });
  }, [contacts, searchQuery, selectedCategories, hasCategory, user?.role]);

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
    setSelectedCategories([]);
  };

  const hasActiveFilters =
    searchQuery.length > 0 || selectedCategories.length > 0;

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
                    Contacts
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {filteredContacts.length} total
                  </p>
                </div>
                {canAccess("contact", "create") && (
                  <Link to="/contacts/new">
                    <Button
                      size="sm"
                      className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </Link>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 bg-background/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                          ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg"
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
                    No contacts found
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
                      onClick={() => setSelectedId(null)}
                      className="md:hidden h-7"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Back
                    </Button>

                    <div className="flex-1" />

                    <div className="flex gap-1.5">
                      {canAccess("contact", "update") && (
                        <Link to={`/contacts/${selectedId}/edit`}>
                          <Button variant="outline" size="sm" className="h-7 px-2">
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
                        onClick={() => setSelectedId(null)}
                        className="hidden md:flex h-7 w-7 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {selectedContact.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-foreground mb-0.5 truncate">
                        {selectedContact.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mb-1.5 truncate">
                        {selectedContact.position ? `${selectedContact.position} at ` : ''}{selectedContact.company}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedContact.categories.map((cat) => (
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
                    <a
                      href={`mailto:${selectedContact.email}`}
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
                          {selectedContact.email}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`tel:${selectedContact.phone}`}
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
                          {selectedContact.phone}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                          Company
                        </p>
                        <p className="font-medium text-xs truncate">
                          {selectedContact.company}
                        </p>
                      </div>
                    </div>

                    {selectedContact.address && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Address
                          </p>
                          <p className="font-medium text-xs truncate">
                            {selectedContact.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedContact.linkedinUrl && (
                      <a
                        href={selectedContact.linkedinUrl}
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
                            {selectedContact.linkedinUrl}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      </a>
                    )}

                    {selectedContact.birthday && (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <div className="w-8 h-8 rounded-md bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-pink-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            Birthday
                          </p>
                          <p className="font-medium text-xs truncate">
                            {new Date(
                              selectedContact.birthday
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
