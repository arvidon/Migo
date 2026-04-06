import { useContext } from "react"
import AnimationWrapper from "../common/page-animation"
import { userContext } from "../App"
import { Link } from "react-router-dom"

const UserNavigationPanel = () => {

    const {userAuth: {username}} = useContext(userContext)
    return(
        <AnimationWrapper transition={{duration:0.2}}>
            <div className="bg-white absolute right-0 border border-grey w-60 overflow-hidden duration-200">
                <Link to='/editor' classname='flex gap-2 link md:hidden pl-8 py-4'>
                    <i className="fi fi-rr-file-edit"></i>
                    <p>write</p>
                </Link>
                <Link to={`/user/${username}`}></Link>
            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel