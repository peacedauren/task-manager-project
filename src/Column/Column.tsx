import { DragEvent, useEffect, useState } from 'react';
import './Column.scss'
import axiosTasks from '../Config/axiosTasks';

type TTask = {
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
    const [tasksId, setTasksId] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>();
    const [currentColumn, setCurrentColumn] = useState<string>();
    const [currentTask, setCurrentTask] = useState<TTask>();

    const getTasks = async () => {
        const { data } = await axiosTasks.get('tasks.json');
        if(data) {
            const dataValues: TTask[] = Object.values(data);
            const dataKeys: string[] = Object.keys(data);
            setTasks(dataValues);
            setTasksId(dataKeys);

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

        await axiosTasks.post(`tasks.json`, {
            type: `${column.column}`,
            task: `${newTask}`
        })
        const copyTasks = tasks;
        copyTasks.push({type: column.column, task: newTask!});
        setTasks([...copyTasks]);
        setNewTask('');
    }

    const toggleShowForm = (index: number) => {
        const updatedColumns = columns.map((column, i) => {
            if (i === index) {
                return { ...column, showForm: !column.showForm };
            }
            return column;
        });
        setColumns(updatedColumns);
    }

    const onDragStartHandler = (e: DragEvent<HTMLDivElement>, task: TTask, column: string) => {
        setCurrentTask(task);
        setCurrentColumn(column);
    }
    
    const onDragLeaveHandler = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.border = '2px solid #FAD02C';
    }
    
    const onDragOverHanlder = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.border = '2px solid #90ADC6';
    }

    const onDropHandler = async (e: DragEvent<HTMLDivElement>, column: string) => {
        e.preventDefault();
        e.currentTarget.style.border = '2px solid #FAD02C';

        const currentIndex = tasks.indexOf(currentTask!);
        await axiosTasks.put(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/tasks/${tasksId[currentIndex]}.json`, { 
            task: currentTask!.task,
            type: column
        });
        tasks.splice(currentIndex, 1, {task: currentTask!.task, type: column});

        setTasks([...tasks]);
    }

    useEffect(() => {
        getTasks()
    }, []);

    return(
        <div className='columns'>
            {columns.map((column, index) => (
                <div 
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
                                    <div 
                                        draggable={true}
                                        key={index} 
                                        className='task' 
                                        onClick={() => console.log(1)}
                                        onDragStart={(e) => onDragStartHandler(e, task, column.column)}
                                    >
                                        {task.task}
                                    </div>
                                :
                                    <></>
                            ))
                        }
                    </div>
                    <form onSubmit={(e) => onCreateCardHandler(e, column)} className='add-card-form' style={{display: column.showForm ? 'block' : 'none'}}>
                        <div className="input-container">
                            <input placeholder='Введите новое задание' className='newTask' onChange={(e) => setNewTask(e.target.value)} value={newTask}/>
                        </div>
                    </form>
                    <div className="add-card">
                        <button onClick={() => toggleShowForm(index)} style={{display: column.showForm ? 'none' : 'flex'}}>
                            <p>+</p>
                            <p>Добавить карточку</p>
                        </button>
                        <button style={{display: column.showForm ? 'block' : 'none'}}>Добавить</button>
                        <button style={{display: column.showForm ? 'block' : 'none'}} onClick={() => toggleShowForm(index)}>X</button>
                    </div>
                </div>
            ))}
        </div>
    );
}