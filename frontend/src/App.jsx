import Navbar from "./components/navbar.component";
import { Routes, Route } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page";
import { lookInSession } from "./common/session";
import { createContext, useEffect, useState } from "react";


export const userContext = createContext()

const App = () => {

    const [userAuth, setUserAuth] = useState()

    useEffect(() => {
        let userInSession = lookInSession('user')

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token: NULL})
    }, [])
    
    return (
        <userContext.Provider value={{userAuth, setUserAuth}}>
            <Routes>
                <Route path='/' element={<Navbar />}>
                    <Route path='/signin' element={<UserAuthForm type="sign-in" />} />
                    <Route path='/signup' element={<UserAuthForm type="sign-up" />} />
                </Route>
            </Routes>
        </userContext.Provider>
        
    )
}

export default App;