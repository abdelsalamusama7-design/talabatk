import { motion } from "framer-motion";
import { forwardRef, ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const PageTransition = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => (
  <motion.div
    ref={ref}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
));

PageTransition.displayName = "PageTransition";

export default PageTransition;
