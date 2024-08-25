import { Badge } from "@/Shared/UI/badge"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@radix-ui/react-context-menu"
import { TTask } from "../Column/Column"

type TTaskCard = {
    index: number,
    task: TTask,
    onDragStart: Function,
    onShowEditModal: Function,
    onDeleteCard: Function
}

export const Task = (data: TTaskCard) => {
    return(
        <ContextMenu key={Date.now() * data.index}>
            <ContextMenuTrigger style={{width: `100%`}}>
                <Badge
                    draggable={true}
                    className='task'
                    key={data.index}
                    onDragStart={() => data.onDragStart(data.task)}
                >
                    <div dangerouslySetInnerHTML={{ __html: data.task.task}}/>
                </Badge>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => data.onShowEditModal(data.index)}>Edit</ContextMenuItem>
                <ContextMenuItem onClick={() => data.onDeleteCard(data.index)}>Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}