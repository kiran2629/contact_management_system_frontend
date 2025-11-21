import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { usePermissions } from '@/hooks/usePermissions';
import { LayoutRouter } from '@/components/layout/LayoutRouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetContactsQuery, useGetContactByIdQuery, useDeleteContactMutation } from '@/store/services/contactsApi';
import { toast } from 'sonner';
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
} from 'lucide-react';
 
const Contacts = () => {
  const { id } = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const { canAccess, hasCategory } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(id || null);
  
  const { data: contacts = [], isLoading } = useGetContactsQuery();
  const { data: selectedContact } = useGetContactByIdQuery(Number(selectedId || 0), {
    skip: !selectedId,
  });
  const [deleteContactMutation, { isLoading: isDeleting }] = useDeleteContactMutation();
 
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const hasAllowedCategory = contact.categories.some(cat => hasCategory(cat));
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());
 
      return hasAllowedCategory && matchesSearch;
    });
  }, [contacts, searchQuery, hasCategory]);

  const handleDelete = async () => {
    if (!selectedContact || !selectedId) return;

    try {
      await deleteContactMutation(Number(selectedId)).unwrap();
      toast.success("Contact deleted successfully");
      setSelectedId(null);
    } catch (error: any) {
      toast.error("Failed to delete contact");
    }
  };
 
  return (
    <LayoutRouter>
      <div className="h-[calc(100vh-140px)]">
        <div className="glass-card rounded-xl border border-border/20 overflow-hidden h-full flex flex-col md:flex-row">
          
          {/* LEFT: Contacts List */}
          <div className={`${selectedId ? 'hidden md:flex' : 'flex'} ${selectedId ? 'md:w-2/5 lg:w-1/3' : 'w-full'} border-r border-border/20 flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="p-4 border-b border-border/10 bg-gradient-to-br from-primary/3 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gradient-shine">Contacts</h1>
                  <p className="text-xs text-muted-foreground">{filteredContacts.length} total</p>
                </div>
                {canAccess('create_contact') && (
                  <Link to="/contacts/new">
                    <Button size="sm" className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
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

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="p-2">
                  {filteredContacts.map((contact, index) => (
                    <motion.button
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ x: 2 }}
                      onClick={() => setSelectedId(contact.id)}
                      className={`w-full p-3 mb-1 rounded-lg transition-all text-left ${
                        selectedId === contact.id
                          ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30'
                          : 'hover:bg-muted/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center font-bold shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-sm">{contact.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                          <div className="flex gap-1 mt-1">
                            {contact.categories.slice(0, 2).map(cat => (
                              <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {filteredContacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No contacts found</p>
                    </div>
                  )}
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
                className={`${selectedId ? 'flex' : 'hidden'} md:flex md:w-3/5 lg:w-2/3 flex-col`}
              >
                {/* Header */}
                <div className="p-4 border-b border-border/10 bg-gradient-to-br from-secondary/3 to-transparent">
                  <div className="flex items-start justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedId(null)}
                      className="md:hidden"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    <div className="flex-1" />

                    <div className="flex gap-2">
                      {canAccess('edit_contact') && (
                        <Link to={`/contacts/${selectedId}/edit`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      {canAccess('delete_contact') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="h-8"
                        >
                          <Trash className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedId(null)}
                        className="hidden md:flex h-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-3xl font-black text-gradient-primary">
                        {selectedContact.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-gradient-shine mb-1">
                        {selectedContact.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedContact.position} at {selectedContact.company}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedContact.categories.map(cat => (
                          <Badge key={cat} className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/30">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid md:grid-cols-2 gap-3 max-w-4xl">
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Email</p>
                        <p className="font-semibold text-sm truncate">{selectedContact.email}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone</p>
                        <p className="font-semibold text-sm">{selectedContact.phone}</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/20">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Company</p>
                        <p className="font-semibold text-sm truncate">{selectedContact.company}</p>
                      </div>
                    </div>

                    {selectedContact.address && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/20">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Address</p>
                          <p className="font-medium text-xs truncate">{selectedContact.address}</p>
                        </div>
                      </div>
                    )}

                    {selectedContact.linkedinUrl && (
                      <a
                        href={selectedContact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Linkedin className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">LinkedIn</p>
                          <p className="font-medium text-xs text-blue-500 truncate">{selectedContact.linkedinUrl}</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </a>
                    )}

                    {selectedContact.birthday && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/20">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Birthday</p>
                          <p className="font-medium text-sm">
                            {new Date(selectedContact.birthday).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
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
                <div className="hidden md:flex md:w-3/5 lg:w-2/3 items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-muted-foreground mb-1">
                      Select a contact
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
