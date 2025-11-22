import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetContactByIdQuery,
  useGetContactsQuery,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";
import { Input } from "@/components/ui/input";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Edit,
  Trash,
  Linkedin,
  Globe,
  Tag,
  Clock,
  Sparkles,
  FileText,
  User,
  Search,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canAccess, hasCategory } = usePermissions();
  const [deleteContactMutation, { isLoading: isDeleting }] =
    useDeleteContactMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all contacts for left sidebar
  const { data: allContacts = [], isLoading: isLoadingContacts } = useGetContactsQuery();

  // Fetch selected contact from API
  const {
    data: contact,
    isLoading,
    error,
  } = useGetContactByIdQuery(id || '', {
    skip: !id,
  });

  // Get user from Redux to check if Admin
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Filter contacts based on search and permissions
  const filteredContacts = useMemo(() => {
    const isAdmin = user?.role === "Admin";
    
    return allContacts.filter((c) => {
      // Admin can see all contacts (backend already filters for non-Admins)
      const hasAllowedCategory = isAdmin || c.categories.some((cat) =>
        hasCategory(cat)
      );
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());

      return hasAllowedCategory && matchesSearch;
    });
  }, [allContacts, searchQuery, hasCategory, user?.role]);

  const handleDelete = async () => {
    if (!contact || !id) return;

    try {
      await deleteContactMutation(String(id)).unwrap();
      toast.success("Contact deleted successfully");
      navigate("/contacts");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          "Failed to delete contact. Please try again."
      );
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/contacts/${id}/edit`);
  };

  if (isLoading) {
    return (
      <LayoutRouter>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground mt-6 text-lg font-medium">
            Loading contact details...
          </p>
        </div>
      </LayoutRouter>
    );
  }

  if (error || !contact) {
    return (
      <LayoutRouter>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="glass-card rounded-3xl p-16 text-center max-w-md shadow-xl">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <ExternalLink className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Contact not found</h3>
            <p className="text-muted-foreground mb-6">
              The contact you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/contacts")}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  return (
    <LayoutRouter>
      <div className="h-[calc(100vh-140px)] w-full">
        <div className="border border-border/20 rounded-lg overflow-hidden h-full flex flex-col md:flex-row bg-card">
          {/* LEFT: Contacts List */}
          <div className={`${id ? "hidden md:flex" : "flex"} ${id ? "md:w-1/2" : "w-full"} border-r border-border/20 flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-border/10 bg-gradient-to-br from-primary/3 to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-foreground">
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
                      className="rounded-md bg-gradient-to-br from-primary to-secondary text-white text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </Link>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-7 md:pl-9 h-8 md:h-9 bg-background/50 border-border/50 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="p-2">
                  <AnimatePresence>
                    {filteredContacts.map((contactItem, index) => (
                      <motion.button
                        key={contactItem.id}
                        initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        whileHover={{ x: 2 }}
                        onClick={() => navigate(`/contacts/${contactItem.id}`)}
                        className={`w-full p-2 md:p-3 mb-1 rounded-lg transition-all text-left ${
                          id === String(contactItem.id)
                            ? "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30"
                            : "hover:bg-muted/30 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-primary/30 shrink-0">
                            {contactItem.profile_photo ? (
                              <AvatarImage 
                                src={contactItem.profile_photo.startsWith('http') 
                                  ? contactItem.profile_photo 
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${contactItem.profile_photo}`} 
                                alt={contactItem.name}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm md:text-base font-semibold text-primary">
                              {contactItem.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {contactItem.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {contactItem.company}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {contactItem.categories.slice(0, 2).map((cat) => (
                                <Badge
                                  key={cat}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4"
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>

                  {filteredContacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No contacts found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Contact Details */}
          <div className={`${id ? "flex" : "hidden md:flex"} md:flex md:w-1/2 flex-col`}>
            {contact ? (
              <div className="flex flex-col h-full">
                    {/* 🎯 Header Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 md:p-3 border-b border-border/20 bg-gradient-to-br from-secondary/3 to-transparent">
            <Button
              variant="ghost"
              onClick={() => navigate("/contacts")}
                    className="border border-border/30 hover:border-primary transition-all rounded-md px-4 py-2 text-sm font-medium"
            >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Back to Contacts</span>
                    <span className="sm:hidden">Back</span>
            </Button>

                  {canAccess("contact", "update") && (
                    <div className="flex gap-2">
                <Button
                  variant="outline"
                        size="sm"
                  onClick={handleEdit}
                        className="border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all rounded-md"
                >
                        <Edit className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">Edit</span>
                </Button>

                      {canAccess("contact", "delete") && (
                <>
                    <Button
                      variant="destructive"
                            size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                            className="border border-destructive/30 hover:border-destructive transition-all rounded-md"
                    >
                            <Trash className="h-4 w-4" />
                    </Button>

                  <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                  >
                            <AlertDialogContent className="border-2">
                      <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                          This action cannot be undone. This will permanently
                          delete the contact
                          <strong className="text-foreground">
                            {" "}
                            {contact?.name}
                          </strong>{" "}
                          and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={isDeleting}
                                  className="rounded-md"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
                        >
                          {isDeleting ? "Deleting..." : "Delete Contact"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}
                </div>

                    {/* 🎨 Main Contact Card */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-4">
                      <Card className="border border-border/30 shadow-sm overflow-hidden rounded-lg">
                        {/* Header */}
                        <CardHeader className="border-b border-border/20 pb-3 pt-4">

                          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              <Avatar className="h-12 w-12 md:h-14 md:w-14 border border-primary/30">
                    {contact.profile_photo ? (
                      <AvatarImage 
                        src={contact.profile_photo.startsWith('http') 
                          ? contact.profile_photo 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${contact.profile_photo}`} 
                        alt={contact.name}
                        className="object-cover"
                      />
                    ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg md:text-xl font-bold text-primary">
                                  {contact.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <CardTitle className="text-lg md:text-xl font-semibold mb-1.5 text-foreground">
                                {contact.name}
                              </CardTitle>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {contact.categories.map((category) => (
                      <Badge 
                        key={category}
                        className="bg-primary/20 border border-primary/40 text-white font-medium px-3 py-1 text-sm rounded-md"
                      >
                          {category}
                        </Badge>
                    ))}
                  </div>

                  {/* Tags if available */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {contact.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-md border text-xs"
                          >
                            #{tag}
                          </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

                        <CardContent className="space-y-4 p-4">
                          {/* 📞 Contact Information Grid */}
                          <div>
                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-primary" />
                              Contact Information
                            </h3>

                            <div className="grid gap-2 md:grid-cols-2">
                              {/* Email */}
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 p-2.5 rounded-md border border-border/30 hover:border-primary/50 bg-card hover:bg-primary/5 transition-colors group/item"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shrink-0">
                                  <Mail className="h-3.5 w-3.5 text-primary" />
                                </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="font-medium text-sm text-foreground truncate group-hover/item:text-primary transition-colors">
                        {contact.email}
                      </p>
                    </div>
                  </a>

                              {/* Phone */}
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-2 p-2.5 rounded-md border border-border/30 hover:border-secondary/50 bg-card hover:bg-secondary/5 transition-colors group/item"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/10 border border-secondary/20 shrink-0">
                                  <Phone className="h-3.5 w-3.5 text-secondary" />
                                </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <p className="font-medium text-sm text-foreground group-hover/item:text-secondary transition-colors">
                        {contact.phone}
                      </p>
                    </div>
                  </a>

                              {/* Company */}
                              <div className="flex items-center gap-2 p-2.5 rounded-md border border-border/30 bg-card">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 border border-accent/20 shrink-0">
                                  <Building2 className="h-3.5 w-3.5 text-accent" />
                                </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Company
                      </p>
                      <p className="font-medium text-sm text-foreground truncate">
                        {contact.company}
                      </p>
                    </div>
                  </div>

                  {/* Position */}
                  {contact.position && (
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/30 bg-card">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Position
                        </p>
                        <p className="font-medium text-sm text-foreground truncate">
                          {contact.position}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                          {/* 🌍 Additional Information */}
                          <div>
                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-secondary" />
                              Additional Details
                            </h3>

                            <div className="space-y-2">
                              {/* Address */}
                              {contact.address && (
                                <div className="flex items-start gap-2 p-2.5 rounded-md border border-border/20 bg-card">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/10 shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                                  </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Address
                        </p>
                        <p className="font-medium text-sm text-foreground">
                          {contact.address}
                        </p>
                      </div>
                    </div>
                  )}

                              {/* LinkedIn */}
                              {contact.linkedinUrl && (
                                <a
                                  href={contact.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2.5 rounded-md border border-border/20 hover:border-blue-500/50 bg-card hover:bg-blue-500/5 transition-colors group/link"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 shrink-0">
                                    <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                                  </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          LinkedIn Profile
                        </p>
                        <p className="font-medium text-sm text-blue-500 group-hover/link:underline truncate">
                          {contact.linkedinUrl}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  )}

                              {/* Birthday */}
                              {contact.birthday && (
                                <div className="flex items-center gap-2 p-2.5 rounded-md border border-border/20 bg-card">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 shrink-0">
                                    <Calendar className="h-3.5 w-3.5 text-accent" />
                                  </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Birthday
                        </p>
                        <p className="font-medium text-sm text-foreground">
                          {new Date(contact.birthday).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {contact.notes && (
                <>
                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  <div className="p-4 rounded-lg border border-border/30 bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Notes
                      </p>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {contact.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Metadata */}
              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* 🕒 Metadata */}
              <div className="p-4 rounded-lg border border-border/20 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Created:</span>
                  <span className="text-xs text-foreground">
                    {new Date(contact.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
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
            )}
          </div>
        </div>
      </div>
    </LayoutRouter>
  );
};

export default ContactDetails;
