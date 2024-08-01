import { DragEvent, useEffect, useState } from 'react';
import { Input } from "@/Shared/UI/input"
import { Badge } from "@/Shared/UI/badge"
import { ScrollArea } from "@/Shared/UI/scroll-area"
import { Button } from "@/Shared/UI/button"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
  } from "@/Shared/UI/context-menu"
import { RocketIcon } from "@radix-ui/react-icons"

import {
Alert,
AlertDescription,
AlertTitle,
} from "@/Shared/UI/alert"
import { IoIosClose } from "react-icons/io";
import axiosTasks from '../../Shared/lib/axiosTasks';
import './Column.scss'
import { EditorModal } from '@/Features/Editor/EditorModal';

export type TTask = {
    id: string
    type: string,
    task: string
}

type TColumn = {
    column: string,
    showForm: boolean
}

export const Column = () => {
    const [columns, setColumns] = useState<TColumn[]>([{column: 'todo', showForm: false}, {column: 'in process', showForm: false}, {column: 'done', showForm: false}]);
    const [tasks, setTasks] = useState<TTask[]>([]);
    const [newTask, setNewTask] = useState<string>('');
    const [currentTask, setCurrentTask] = useState<number>();
    const [showAlert, setShowAlert] = useState(false);
    const[isModalClosed, setIsModalClosed] = useState(false);
    const [editingTask, setEditingTask] = useState<TTask | null>(null);

    const onCloseModalHanlder = () => {
        setIsModalClosed(false);
    }

    const onShowEditModalHandler = (index: number) => {
        setIsModalClosed(true);
        setEditingTask(tasks[index]);
    }

    const getTasks = async () => {
        const { data } = await axiosTasks.get('tasks.json');
        if(data) {
            const dataValues: Omit<TTask, 'id'>[] = Object.values(data);
            const dataKeys: string[] = Object.keys(data);

            dataValues.map((value, index) => {
                const copyTasks = tasks;
                copyTasks.push({
                    id: dataKeys[index],
                    task: value.task,
                    type: value.type
                })
                setTasks([...copyTasks]);
            })

            dataValues.map((task) => {
                if(!columns.find(column => column.column === task.type)) {
                    const copyColumns = columns;
                    copyColumns.push({column: task.type, showForm: false});
                    setColumns([...copyColumns]);
                }
            })
        }
    }

    const onCreateCardHandler = async (e: React.FormEvent, column: TColumn) => {
        e.preventDefault();

        if(newTask) {
            if(newTask.trim() !== '') {
                setShowAlert(false);
                await axiosTasks.post(`tasks.json`, {
                    type: `${column.column}`,
                    task: `${newTask}`,
                }).then (response => {
                    const copyTasks = tasks;
                    copyTasks.push({id: response.data.name, type: column.column, task: newTask!});
                    setTasks([...copyTasks]);
                })
                setNewTask('');
            } else {
                setShowAlert(true);
            }
        } else {
            setShowAlert(true);
        }
    }

    const toggleShowForm = (index: number) => {
        const updatedColumns = columns.map((column, i) => {
            if (i === index) {
                return { ...column, showForm: !column.showForm };
            } else {
                return { ...column, showForm: false};
            }
        });
        setColumns(updatedColumns);
    }

    const onDragStartHandler = (task: TTask) => {
        setCurrentTask(tasks.indexOf(task));
    }
    
    const onDragLeaveHandler = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.border = '2px solid hsl(var(--primary) / 0.8)';
    }
    
    const onDragOverHanlder = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.border = '2px solid #0275d8';
    }

    const onDropHandler = async (e: DragEvent<HTMLDivElement>, column: string) => {
        e.preventDefault();
        e.currentTarget.style.border = '2px solid hsl(var(--primary) / 0.8)';
        await axiosTasks.put(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/tasks/${tasks[currentTask!].id}.json`, { 
            task: tasks[currentTask!].task,
            type: column
        });
        tasks.splice(currentTask!, 1, {id: tasks[currentTask!].id, task: tasks[currentTask!].task, type: column});

        setTasks([...tasks]);
    }

    const onDeleteCardHanlder = async (index: number) => {
        if(tasks.length === 1) {
            setTasks([...[]]);
        } else {
            setTasks([...tasks.filter((_task, i) => i !== index)]);
        }
        await axiosTasks.delete(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/tasks/${tasks[index!].id}.json`);
    }

    useEffect(() => {
        const copyTasks = tasks;
        copyTasks.splice(0, copyTasks.length);
        setTasks([...copyTasks]);
        getTasks();
    }, []);

    return(
        <div className="page">
            <EditorModal 
                isClosed={isModalClosed} 
                onCloseModal={onCloseModalHanlder} 
                setIsClosed={setIsModalClosed} 
                task={editingTask!}
                setEditedTask={setTasks}
                allTasks={tasks}
            />
            <div className='columns'>
                {columns.map((column, index) => (
                    <ScrollArea 
                        className='column'
                        onDragOver={(e) => onDragOverHanlder(e)}
                        onDragLeave={(e) => onDragLeaveHandler(e)}
                        onDrop={(e) => onDropHandler(e, column.column)}
                    >
                        <div className="column-header">
                            {column.column}
                        </div>
                        <div className="tasks">
                            {
                                tasks.map((task, index) => (
                                    task.type === column.column
                                    ? 
                                        <ContextMenu key={Date.now() * index}>
                                            <ContextMenuTrigger style={{width: `100%`}}>
                                                <Badge
                                                    draggable={true}
                                                    className='task'
                                                    key={index}
                                                    onDragStart={() => onDragStartHandler(task)}
                                                >
                                                    <div dangerouslySetInnerHTML={{ __html: task.task}}/>
                                                </Badge>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent>
                                                <ContextMenuItem onClick={() => onShowEditModalHandler(index)}>Edit</ContextMenuItem>
                                                <ContextMenuItem onClick={() => onDeleteCardHanlder(index)}>Delete</ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    :
                                        <></>
                                ))
                            }
                        </div>
                        <form onSubmit={(e) => onCreateCardHandler(e, column)} className='add-card-form' style={{display: column.showForm ? 'block' : 'none'}}>
                            <div className="input-container">
                                <Input placeholder='Введите новое задание' className='newTask' onChange={(e) => setNewTask(e.target.value)} value={newTask}/>
                            </div>
                        </form>
                        <div className="add-card">
                            <Button onClick={() => toggleShowForm(index)} style={{display: column.showForm ? 'none' : 'flex'}}>
                                <p>+</p>
                                <p>Добавить карточку</p>
                            </Button>
                            <Button style={{display: column.showForm ? 'block' : 'none'}} onClick={(e) => onCreateCardHandler(e, column)}>Добавить</Button>
                            <Button style={{display: column.showForm ? 'block' : 'none', fontSize: "20px"}} onClick={() => toggleShowForm(index)} className='edit-cancel'><IoIosClose /></Button>
                        </div>
                    </ScrollArea>
                ))}
            </div>
            <div className="alert">
                <Alert style={{display: showAlert ? 'block' : 'none', borderColor: "#d9534f", color: '#d9534f'}}>
                    <RocketIcon className="h-4 w-4" style={{color: "#d9534f"}}/>
                    <AlertTitle>Write your Task</AlertTitle>
                    <AlertDescription>
                        You must write a task to post it.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}