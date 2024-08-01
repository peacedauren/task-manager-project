import { useContext, useEffect, useRef } from "react"
import { EditorContext } from "./EditorContext"
import axiosTasks from "@/Shared/lib/axiosTasks"
import { TTask } from "@/Entities/Column/Column"
import Modal from "../Modal/Modal"

type TEditor = {
    task?: TTask,
    isClosed: boolean, 
    onCloseModal: VoidFunction,
    setIsClosed: Function,
    setEditedTask: Function,
    allTasks: TTask[]
}

export const EditorModal = (editor: TEditor) => {
    const {initEditor, editorInstanceRef} = useContext(EditorContext);
    const editorRef = useRef<boolean | null>(null);

    const onSaveButtonHandler = async () => {
        const data = await editorInstanceRef.current.save();

        axiosTasks.put(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/tasks/${editor.task?.id}.json`, {
            task: data.blocks[0].data.text,
            type: editor.task?.type
        })

        const copyTasks = editor.allTasks;

        copyTasks.splice(editor.allTasks.indexOf(editor.task!), 1, {
            id: editor.task!.id,
            task: data.blocks[0].data.text,
            type: editor.task!.type
        })

        editor.setEditedTask([...copyTasks])

        editor.setIsClosed(false);
    }

    useEffect(() => {
        if(!editorRef.current) {
            initEditor();
            editorRef.current = true;
        }
    }, [])

    return(
        <Modal show={editor.isClosed} onCloseModal={editor.onCloseModal} title={"Edit your task"}>
            <div>
                <div id={'editorjs'}></div>
                <hr />
                <button onClick={onSaveButtonHandler}>Save</button>
            </div>
        </Modal>
    )
}