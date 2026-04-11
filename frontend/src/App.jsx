import Navbar from "./components/navbar.component";
import { Routes, Route } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page";
import { lookInSession } from "./common/session";
import { createContext, useEffect, useState } from "react";
import Editor from "./pages/editor.pages";

export const userContext = createContext();

const App = () => {
    const [userAuth, setUserAuth] = useState({ access_token: null });

    useEffect(() => {
        const userInSession = lookInSession("user");

        if (userInSession) {
            setUserAuth(JSON.parse(userInSession));
        }
    }, []);

    return (
        <userContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
                <Route path="/editor" element={<Editor />} />
                <Route path="/" element={<Navbar />}>
                    <Route index element={<div>Home</div>} />
                    <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                </Route>
            </Routes>
        </userContext.Provider>
    );
};

export default App;