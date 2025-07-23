'use client'

import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import loginAnimation from '@/public/animations/login.json'

export default function LoginAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 30 }}
      transition={{ duration: 0.4 }}
      className="w-46 h-46"
    >
      <Lottie animationData={loginAnimation} loop={true} autoplay={true} />
    </motion.div>
  )
}
