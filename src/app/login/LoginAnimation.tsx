'use client'

import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import loginAnimation from '@/public/animations/login.json'

export default function LoginAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute top-26 left-1/2 -translate-x-1/2"
      style={{ width: 192, height: 192, pointerEvents: 'none', zIndex: 10 }}
    >
      <Lottie animationData={loginAnimation} loop autoplay />
    </motion.div>
  )
}
