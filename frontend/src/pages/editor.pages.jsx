import { useContext, useState } from "react"
import { Navigate } from "react-router-dom"
import { userContext } from "../App"
import BlogEditor from "../components/blog-editor.component"
import PublishForm from "../components/publish-form.component"
import { createContext } from "react"

 const blogStructure = {
        title: '',
        banner: '',
        content: [],
        tags: [],
        des: '',
        author: {personal_info: { }}
}

export const EditorContext = createContext({ })

const Editor = () => {
    const [blog, setBlog] = useState(blogStructure)
    const [editorState, setEditorState] = useState("editor")

    const { userAuth } = useContext(userContext)

    return ( 
        <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState}}>
            {
                !userAuth?.access_token
                ? <Navigate to="/signin" />
                : editorState == "editor" ? <BlogEditor /> : <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor