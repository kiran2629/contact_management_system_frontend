import { motion } from 'framer-motion';

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-md">
      <div className="flex items-start gap-4">
        <motion.div
          className="h-14 w-14 rounded-full bg-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="flex-1 space-y-3">
          <motion.div
            className="h-5 w-3/4 rounded bg-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="h-4 w-1/2 rounded bg-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <div className="space-y-2">
            <motion.div
              className="h-3 w-full rounded bg-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="h-3 w-2/3 rounded bg-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatSkeleton = () => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="h-4 w-24 rounded bg-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-10 w-10 rounded-lg bg-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
      </div>
      <motion.div
        className="h-8 w-16 rounded bg-muted mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="h-3 w-20 rounded bg-muted"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
};
