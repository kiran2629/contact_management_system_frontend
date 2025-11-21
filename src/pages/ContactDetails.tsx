import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { usePermissions } from '@/hooks/usePermissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { canAccess, canView } = usePermissions();

  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Contact not found</p>
          <Button onClick={() => navigate('/contacts')} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </AppLayout>
    );
  }

  const infoItems = [
    { label: 'Email', value: contact.email, icon: Mail, show: canView('email') },
    { label: 'Phone', value: contact.phone, icon: Phone, show: canView('phone') },
    { label: 'Company', value: contact.company, icon: Building2, show: true },
    { label: 'Position', value: contact.position, icon: Briefcase, show: true },
    { label: 'Address', value: contact.address, icon: MapPin, show: canView('address') },
    { label: 'Birthday', value: new Date(contact.birthday).toLocaleDateString(), icon: Calendar, show: canView('birthday') },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {canAccess('edit_contact') && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              {canAccess('delete_contact') && (
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                  <span className="text-3xl font-bold text-primary">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{contact.name}</CardTitle>
                  <p className="text-lg text-muted-foreground">{contact.position}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {contact.categories.map(category => (
                      <Badge key={category}>{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                {infoItems.filter(item => item.show).map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* LinkedIn */}
              {contact.linkedinUrl && canView('linkedin') && (
                <>
                  <Separator />
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View LinkedIn Profile
                  </a>
                </>
              )}

              {/* Notes */}
              {contact.notes && canView('notes') && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Notes</h3>
                    <p className="text-muted-foreground">{contact.notes}</p>
                  </div>
                </>
              )}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Metadata */}
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(contact.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(contact.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ContactDetails;
