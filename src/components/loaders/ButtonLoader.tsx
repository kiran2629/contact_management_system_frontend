import { motion } from 'framer-motion';

export const ButtonLoader = ({ size = 16 }: { size?: number }) => {
  return (
    <motion.div
      className="inline-block rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
};
