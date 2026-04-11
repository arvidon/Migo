import { useContext, useState } from "react"
import { Navigate } from "react-router-dom"
import { userContext } from "../App"
import BlogEditor from "../components/blog-editor.component"
import PublishForm from "../components/publish-form.component"

const Editor = () => {

    const [editorState, setEditorState] = useState("editor")

    const { userAuth } = useContext(userContext)

    return !userAuth?.access_token
        ? <Navigate to="/signin" />
        : editorState == "editor" ? <BlogEditor /> : <PublishForm/>
}

export default Editor