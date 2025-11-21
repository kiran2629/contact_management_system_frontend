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
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/contacts')}
            className="border-2 border-border/50 hover:border-primary transition-all hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {canAccess('edit_contact') && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {canAccess('delete_contact') && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="border-2 border-destructive/30 hover:border-destructive transition-all shadow-lg hover:shadow-xl"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </motion.div>
 
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
            {/* Gradient header background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
           
            <CardHeader className="border-b-2 border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5 pb-6">
              <div className="flex items-start gap-6">
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary/30 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {contact.name.charAt(0)}
                  </span>
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {contact.name}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground font-medium mb-4">{contact.position}</p>
                  <div className="flex flex-wrap gap-2">
                    {contact.categories.map(category => (
                      <Badge
                        key={category}
                        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary font-semibold px-3 py-1"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
 
              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                {infoItems.filter(item => item.show).map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 group"
                  >
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
 
              {/* LinkedIn */}
              {contact.linkedinUrl && canView('linkedin') && (
                <>
                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  <motion.a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-primary group-hover:underline">View LinkedIn Profile</span>
                  </motion.a>
                </>
              )}
 
              {/* Notes */}
              {contact.notes && canView('notes') && (
                <>
                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border-2 border-border/30 bg-muted/30"
                  >
                    <h3 className="mb-3 font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Notes
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{contact.notes}</p>
                  </motion.div>
                </>
              )}
 
              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <>
                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border-2 border-border/30 bg-muted/30"
                  >
                    <h3 className="mb-3 font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-2 border-border/50 hover:border-primary/50 bg-background/50 hover:bg-primary/10 transition-all duration-300 px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
 
              {/* Metadata */}
              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl border-2 border-border/30 bg-muted/20 text-sm"
              >
                <p className="text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">Created:</span> {new Date(contact.created_at).toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Last Updated:</span> {new Date(contact.updated_at).toLocaleString()}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
 
export default ContactDetails;