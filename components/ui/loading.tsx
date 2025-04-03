import { motion } from "framer-motion"

const Loading = () => {
    return (
        <div className="flex items-center justify-center">
            <motion.div
                className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        </div>
    )
}

export default Loading