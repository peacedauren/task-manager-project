import { DragEvent, useEffect, useRef, useState } from 'react';
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
import { Task } from '../Task/Task';

export type TTask = {
    id: string
    type: string,
    task: string
}

type TColumn = {
    id: string,
    column: string,
    showForm: boolean
}

export const Column = () => {
    const [columns, setColumns] = useState<TColumn[]>([]);
    const [tasks, setTasks] = useState<TTask[]>([]);
    const [currentTask, setCurrentTask] = useState<number>();
    const [showAlert, setShowAlert] = useState(false);
    const [isModalClosed, setIsModalClosed] = useState(false);
    const [editingTask, setEditingTask] = useState<TTask | null>(null);
    const [showNewColumn, setShowNewColumn] = useState<boolean>(false);
    const [newColumn, setNewColumn] = useState<string>();
    const [editColumn, setEditColumn] = useState<number | null>(null);
    const editingColumnName = useRef<HTMLInputElement>(null);
    const newTask = useRef<HTMLInputElement>(null);

    const onCloseModalHanlder = () => {
        setIsModalClosed(false);
    }

    const onShowEditModalHandler = (index: number) => {
        setIsModalClosed(true);
        setEditingTask(tasks[index]);
    }

    const getData = async () => {
        const { data } = await axiosTasks.get('tasks.json');
        const dataColumns = await axiosTasks.get('columns.json');

        if(dataColumns.data) {
            const takenColumns: TColumn[] = Object.values(dataColumns.data);
            const takenColumnsId: string[] = Object.keys(dataColumns.data);

            takenColumns.map((takenColumn, index) => {
                if(!columns.find(column => column.column === takenColumn.column)) {
                    const copyColumns = columns;
                    copyColumns.push({id: takenColumnsId[index], column: takenColumn.column, showForm: false});
                    setColumns([...copyColumns]);
                }
            })
        }

        if(data) {
            const dataValues: Omit<TTask, 'id'>[] = Object.values(data);
            const dataKeys: string[] = Object.keys(data);

            dataValues.forEach((value, index) => {
                const copyTasks = tasks;
                copyTasks.push({
                    id: dataKeys[index],
                    task: value.task,
                    type: value.type
                })
                setTasks([...copyTasks]);
            })
        }
    }

    const onCreateCardHandler = async (e: React.FormEvent, column: TColumn) => {
        e.preventDefault();

        if(newTask) {
            if(newTask.current?.value.trim() !== '') {
                setShowAlert(false);
                await axiosTasks.post(`tasks.json`, {
                    type: `${column.column}`,
                    task: `${newTask.current?.value}`,
                }).then (response => {
                    const copyTasks = tasks;
                    copyTasks.push({id: response.data.name, type: column.column, task: newTask.current?.value!});
                    setTasks([...copyTasks]);
                })
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

    const addColumnHandler = () => {
        setShowNewColumn(!showNewColumn);
    }

    const addNewColumnHandler = async (e: any) => {
        e.preventDefault();

        await axiosTasks.post('columns.json', {
            column: `${newColumn}`,
            showForm: `false`,
        }).then (response => {
            const copyColumns = columns;
            copyColumns.push({id: response.data.name, column: newColumn!, showForm: false});
            setColumns([...copyColumns]);
        })

        setShowNewColumn(false);
    }

    const onDeleteColumnHandler = async (column: TColumn) => {
        await axiosTasks.delete(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/columns/${column.id}.json`);

        const copyColumns = columns;
        copyColumns.splice(columns.indexOf(column), 1);
        setColumns([...copyColumns]);
    }

    const onEditColumnHanlder = async (e: React.FormEvent, column: TColumn) => {
        e.preventDefault();

        const newColumnName = editingColumnName!.current?.value;

        await axiosTasks.put(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/columns/${column.id}.json`, { 
            column: newColumnName,
            showForm: false
        });

        columns.splice(columns.indexOf(column), 1, {
            id: column.id,
            column: newColumnName!,
            showForm: false
        });

        tasks.map(async (task, index) => {
            if(task.type === column.column) {
                await axiosTasks.put(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/tasks/${task.id}.json`, { 
                    task: task.task,
                    type: newColumnName
                });
                
                tasks.splice(index, 1, {
                    id: task.id,
                    task: task.task,
                    type: newColumnName!
                })
            }
        })

        setEditColumn(null);
    }

    useEffect(() => {
        const copyTasks = tasks;
        copyTasks.splice(0, copyTasks.length);
        setTasks([...copyTasks]);
        getData();
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
                    <ContextMenu key={Date.now() * index}>
                        <ContextMenuTrigger>
                            <ScrollArea
                                key={index * Date.now()}
                                className='column'
                                onDragOver={(e) => onDragOverHanlder(e)}
                                onDragLeave={(e) => onDragLeaveHandler(e)}
                                onDrop={(e) => onDropHandler(e, column.column)}
                            >
                                {
                                    editColumn === index 
                                    ? 
                                        <form style={{display: "flex", flexDirection: "column", alignItems: "center", margin: '5px 0'}} onSubmit={(e) => {onEditColumnHanlder(e, column)}}>
                                            <Input 
                                                style={{width: '100%'}}
                                                defaultValue={column.column}
                                                ref={editingColumnName}
                                            />
                                            <div className="form-buttons" style={{width: '80%', marginTop: '5px', display: 'flex', justifyContent: "space-between"}}>
                                                <Button style={{width: '45%', background: "green", fontSize: "20px"}} type='submit'>+</Button>
                                                <Button style={{width: '45%', background: "red", fontSize: "20px"}} onClick={() => setEditColumn(null)}><IoIosClose /></Button>
                                            </div>
                                        </form>
                                    :
                                        <div className="column-header">
                                            {column.column}
                                        </div>
                                        
                                }
                                <div className="tasks">
                                    {
                                        tasks.map((task, index) => (
                                            task.type === column.column
                                            ? 
                                                <Task index={index} task={task} onDragStart={onDragStartHandler} onDeleteCard={onDeleteCardHanlder} onShowEditModal={onShowEditModalHandler}/>
                                            :
                                                <></>
                                        ))
                                    }
                                </div>
                                <form onSubmit={(e) => onCreateCardHandler(e, column)} className='add-card-form' style={{display: column.showForm ? 'block' : 'none'}}>
                                    <div className="input-container">
                                        <Input placeholder='Введите новое задание' className='newTask' ref={newTask}/>
                                    </div>
                                </form>
                                <div className="add-card">
                                    <Button onClick={() => toggleShowForm(index)} style={{display: column.showForm ? 'none' : 'flex'}}>
                                        <p>+ Добавить карточку</p>
                                    </Button>
                                    <Button style={{display: column.showForm ? 'block' : 'none'}} onClick={(e) => onCreateCardHandler(e, column)}>Добавить</Button>
                                    <Button style={{display: column.showForm ? 'block' : 'none', fontSize: "20px"}} onClick={() => toggleShowForm(index)} className='edit-cancel'><IoIosClose /></Button>
                                </div>
                            </ScrollArea>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => {setEditColumn(index)}}>Edit</ContextMenuItem>
                            <ContextMenuItem onClick={() => {onDeleteColumnHandler(column)}}>Delete</ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                ))}
                <form onSubmit={addNewColumnHandler}>
                    <ScrollArea className='column new-column' style={{display: showNewColumn ? 'flex' : 'none'}}>
                        <Input placeholder='Введите название таблицы...' style={{marginTop: "10px"}} onChange={(e) => setNewColumn(e.target.value)}/>
                        <div className='add-card confirm-new-column-btn'>
                            <Button type='submit'>+ Добавить колонку</Button>
                        </div>
                    </ScrollArea>
                </form>
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
            <button className='add-column-btn' onClick={addColumnHandler}>+</button>
        </div>
    );
}