import { createContext, useRef } from "react";
import EditorJS from '@editorjs/editorjs'
import Marker from '@editorjs/marker'
import Underline from '@editorjs/underline'

export const EditorContext = createContext<any | undefined>(undefined);

export const EditorContextProvider = (props: any) => {
    const editorInstanceRef = useRef<EditorJS | null>(null);

    const initEditor = () => {
        const editor = new EditorJS({
            holder: 'editorjs',
            placeholder: 'Edit your task',
            tools: {
                Marker: {
                    class: Marker,
                },
                underline: {
                    class: Underline,
                },
            }
        })
        editorInstanceRef.current = editor
    }
    return(
        <EditorContext.Provider value={{initEditor, editorInstanceRef}}>
            {props.children}
        </EditorContext.Provider>
    )
}