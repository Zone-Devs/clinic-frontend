import { motion } from 'framer-motion'

export default function Spinner() {
    return (
        <div className="flex flex-col items-center justify-center h-[300px] w-full space-y-4">
            <motion.div
            className="w-10 h-10 border-4 border-muted border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            >
            Cargando...
            </motion.p>
        </div>
    )
}