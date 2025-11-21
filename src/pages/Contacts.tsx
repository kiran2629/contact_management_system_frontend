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
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const Contacts = () => {
  const navigate = useNavigate();
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { user } = useSelector((state: RootState) => state.auth);
  const { canAccess, hasCategory } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your contact relationships
            </p>
          </div>
          {canAccess('create_contact') && (
            <Button onClick={() => navigate('/contacts/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Contacts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10"
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                      <span className="text-xl font-bold text-primary">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{contact.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{contact.position}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {contact.categories.slice(0, 2).map(category => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                    {contact.categories.length > 2 && (
                      <Badge variant="outline">+{contact.categories.length - 2}</Badge>
                    )}
                  </div>

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No contacts found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or add a new contact
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Contacts;
