import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-6xl font-bold">404</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
