import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { usePermissions } from '@/hooks/usePermissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGetContactsQuery } from '@/store/services/contactsApi';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
 
const Contacts = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { canAccess, hasCategory } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch contacts from API
  const { data: contacts = [], isLoading, error } = useGetContactsQuery();
 
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const hasAllowedCategory = contact.categories.some(cat => hasCategory(cat));
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());
 
      return hasAllowedCategory && matchesSearch;
    });
  }, [contacts, searchQuery, hasCategory]);
 
  return (
    <AppLayout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-3xl -z-10" />
          <div className="relative border-2 border-border/50 rounded-2xl p-6 bg-card/50 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Contacts
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Manage your contact relationships
                </p>
              </div>
              {canAccess('create_contact') && (
                <Button
                  onClick={() => navigate('/contacts/new')}
                  className="border-2 border-primary/30 hover:border-primary transition-all shadow-lg hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              )}
            </div>
          </div>
        </motion.div>
 
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="Search contacts..."
              className="pl-12 pr-4 py-6 text-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
 
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading contacts...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-full blur-3xl" />
              <div className="relative border-2 border-destructive/50 rounded-2xl p-12 bg-card/50 backdrop-blur-sm">
                <p className="text-2xl font-bold text-center mb-2 text-destructive">
                  Error loading contacts
                </p>
                <p className="text-muted-foreground text-center">
                  Please try again later
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contacts Grid */}
        {!isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card
                className="group cursor-pointer transition-all duration-300 border-2 border-border/50 hover:border-primary/50 shadow-xl hover:shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden relative"
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
               
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {contact.name.charAt(0)}
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ scale: 1.2, rotate: 90 }}
                    >
                      <ExternalLink className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
 
                  <h3 className="mb-1 text-xl font-bold group-hover:text-primary transition-colors">
                    {contact.name}
                  </h3>
 
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="truncate text-muted-foreground">{contact.company}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
                        <Mail className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="truncate text-muted-foreground">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Phone className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-muted-foreground">{contact.phone}</span>
                    </div>
                  </div>
 
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contact.categories.slice(0, 2).map(category => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary font-semibold"
                      >
                        {category}
                      </Badge>
                    ))}
                    {contact.categories.length > 2 && (
                      <Badge variant="outline" className="border-2">
                        +{contact.categories.length - 2}
                      </Badge>
                    )}
                  </div>
 
                </CardContent>
              </Card>
            </motion.div>
            ))}
          </div>
        )}
 
        {!isLoading && !error && filteredContacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <div className="relative border-2 border-border/50 rounded-2xl p-12 bg-card/50 backdrop-blur-sm">
                <p className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  No contacts found
                </p>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search or add a new contact
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};
 
export default Contacts;
 
 