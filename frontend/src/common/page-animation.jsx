import {AnimatePresence, motion} from "framer-motion"

const AnimationWrapper = ({children, keyvalue, animate={opacity:1}, initial={opacity: 0}, transition={duration: 1}, className}) => {
    return(
        <AnimatePresence>
            <motion.div
                key={keyvalue}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default AnimationWrapper