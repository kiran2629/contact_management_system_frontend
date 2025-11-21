import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetContactByIdQuery, useDeleteContactMutation } from "@/store/services/contactsApi";
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
} from 'lucide-react';
 
const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const [deleteContactMutation, { isLoading: isDeleting }] = useDeleteContactMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch contact from API
  const { data: contact, isLoading, error } = useGetContactByIdQuery(Number(id || 0), {
    skip: !id,
  });

  const handleDelete = async () => {
    if (!contact || !id) return;

    try {
      await deleteContactMutation(Number(id)).unwrap();
      toast.success("Contact deleted successfully");
      navigate("/contacts");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.data?.error || "Failed to delete contact. Please try again."
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
          <p className="text-muted-foreground mt-6 text-lg font-medium">Loading contact details...</p>
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
            <Button onClick={() => navigate("/contacts")} className="rounded-xl">
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
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* 🎯 Header Actions */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/contacts')}
              className="glass-card border-2 border-border/30 hover:border-primary transition-all rounded-xl px-6 py-6 font-semibold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Contacts
            </Button>
          </motion.div>

          {canAccess("edit_contact") && (
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleEdit}
                  className="glass-card w-12 h-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all rounded-xl"
                >
                  <Edit className="h-5 w-5 text-primary" />
                </Button>
              </motion.div>

              {canAccess('delete_contact') && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-12 h-12 border-2 border-destructive/30 hover:border-destructive transition-all shadow-lg hover:shadow-xl rounded-xl"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </motion.div>

                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="glass-card border-2">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          This action cannot be undone. This will permanently delete the contact
                          <strong className="text-foreground"> {contact?.name}</strong> and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
        </motion.div>
 
        {/* 🎨 Main Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative group"
        >
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
          
          <Card className="glass-card border-2 border-border/30 shadow-2xl overflow-hidden rounded-3xl">
            {/* ✨ Premium Header */}
            <CardHeader className="relative border-b-2 border-border/20 pb-8 pt-8">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-50" style={{ backgroundSize: '200% 200%' }} />
              
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  className="relative group/avatar"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl opacity-50 group-hover/avatar:opacity-100 transition-opacity animate-pulse-glow" />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary/30 shadow-2xl">
                    <span className="text-6xl font-black text-gradient-shine">
                      {contact.name.charAt(0)}
                    </span>
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardTitle className="text-4xl md:text-5xl font-black mb-4 text-gradient-shine">
                      {contact.name}
                    </CardTitle>
                  </motion.div>

                  {/* Categories */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3"
                  >
                    {contact.categories.map((category, idx) => (
                      <motion.div
                        key={category}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Badge
                          className="bg-gradient-to-r from-primary/30 to-secondary/30 border-2 border-primary/40 text-primary font-bold px-4 py-2 text-base rounded-full shadow-lg hover:shadow-glow transition-all"
                        >
                          <Tag className="mr-1.5 h-4 w-4" />
                          {category}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Tags if available */}
                  {contact.tags && contact.tags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap gap-2 mt-4"
                    >
                      {contact.tags.map((tag, idx) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + idx * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge variant="outline" className="rounded-full border-2">
                            #{tag}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              {/* 📞 Contact Information Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Contact Information
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}
                  <motion.a
                    href={`mailto:${contact.email}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/30 hover:border-primary/50 glass-card hover:shadow-lg transition-all duration-300 group/item"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 group-hover/item:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                      <p className="font-bold text-lg group-hover/item:text-primary transition-colors truncate">{contact.email}</p>
                    </div>
                  </motion.a>

                  {/* Phone */}
                  <motion.a
                    href={`tel:${contact.phone}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/30 hover:border-secondary/50 glass-card hover:shadow-lg transition-all duration-300 group/item"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 border-2 border-secondary/30 group-hover/item:scale-110 transition-transform">
                      <Phone className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                      <p className="font-bold text-lg group-hover/item:text-secondary transition-colors">{contact.phone}</p>
                    </div>
                  </motion.a>

                  {/* Company */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/30 hover:border-accent/50 glass-card hover:shadow-lg transition-all duration-300 group/item"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/30 group-hover/item:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Company</p>
                      <p className="font-bold text-lg group-hover/item:text-accent transition-colors truncate">{contact.company}</p>
                    </div>
                  </motion.div>

                  {/* Position */}
                  {contact.position && (
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/30 hover:border-primary/50 glass-card hover:shadow-lg transition-all duration-300 group/item"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 group-hover/item:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Position</p>
                        <p className="font-bold text-lg group-hover/item:text-primary transition-colors truncate">{contact.position}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* 🌍 Additional Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-secondary" />
                  Additional Details
                </h3>

                <div className="space-y-4">
                  {/* Address */}
                  {contact.address && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-4 p-5 rounded-2xl glass-card border-2 border-border/20 hover:border-secondary/30 transition-all"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                        <MapPin className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                        <p className="font-semibold text-lg">{contact.address}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* LinkedIn */}
                  {contact.linkedinUrl && (
                    <motion.a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 p-5 rounded-2xl glass-card border-2 border-border/20 hover:border-blue-500/50 transition-all group/link"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 group-hover/link:bg-blue-500/20 transition-colors">
                        <Linkedin className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">LinkedIn Profile</p>
                        <p className="font-semibold text-blue-500 group-hover/link:underline truncate">{contact.linkedinUrl}</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </motion.a>
                  )}

                  {/* Birthday */}
                  {contact.birthday && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 p-5 rounded-2xl glass-card border-2 border-border/20 hover:border-accent/30 transition-all"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Birthday</p>
                        <p className="font-semibold text-lg">{new Date(contact.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* 🕒 Metadata */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-2xl glass-card border-2 border-border/20"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Created:</span>
                  <span className="font-bold text-foreground">
                    {new Date(contact.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LayoutRouter>
  );
};
 
export default ContactDetails;
