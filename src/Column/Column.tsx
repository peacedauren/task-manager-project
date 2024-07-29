import { DragEvent, useEffect, useState } from 'react';
import './Column.scss'
import axiosTasks from '../Config/axiosTasks';

type TColumn = {
    tableName: string;
    type: string
}

type TTask = {
    type: string,
    task: string,
    
}

export const Column = (column: TColumn) => {
    const [tasks, setTasks] = useState<TTask[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState<string>('');
    const [currendDrag, setCurrentDrag] = useState<TTask>();

    const getTasks = async () => {
        const { data } = await axiosTasks.get('tasks.json');
        if(data) {
            const dataMas: TTask[] = Object.values(data);
            
            dataMas.map((task) => {
                const copyTasks = tasks;
                if(task.type === column.type) {
                    copyTasks.push(task);
                }
                setTasks([...copyTasks]);
            })
        }
    }
    const onCreateCardHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        await axiosTasks.post(`tasks.json`, {
            type: `${column.type}`,
            task: `${newTask}`
        })
        const copyTasks = tasks;
        copyTasks.push({type: column.type, task: newTask!});
        setTasks([...copyTasks]);
        setNewTask('');
    }

    useEffect(() => {
        const copyTasks = tasks;
        copyTasks.splice(0, copyTasks.length);
        setTasks([...copyTasks]);
        getTasks();
    }, []);

    const onDragStartHandler = async (e: DragEvent<HTMLDivElement>, task: TTask) => {      
        await axiosTasks.delete(`https://task-manager-project-66e0f-default-rtdb.firebaseio.com/currentDragTask.json`);
        await axiosTasks.post('currentDragTask.json', task);
    }

    const onDragLeaveHandler = (e) => {
        e.currentTarget.style.border = '1px solid #FAD02C';
    }

    const onDragOverHandler = (e) => {
        e.preventDefault();

        e.currentTarget.style.border = '1px solid black';
    }

    const onDropHandler = async (e, columnType: string) => {
        e.currentTarget.style.border = '1px solid #FAD02C';
        e.preventDefault();
        console.log(currendDrag);

        const copyTasks = tasks;
        const { data } = await axiosTasks.get('currentDragTask.json');
        const dataMas: TTask[] = Object.values(data);
        const dataKeys: string[] = Object.keys(data);
        if(data) {
            copyTasks.push(dataMas[0]);
        }
        setTasks([...copyTasks]);
    }

    return(
        <div className='column' onDragOver={(e) => onDragOverHandler(e)} onDragLeave={(e) => onDragLeaveHandler(e)} onDrop={(e) => onDropHandler(e, column.type)}>
            <div className="column-header">
                {column.tableName}
            </div>
            <div className="tasks">
                {
                    tasks.map((task, index) => (
                        <div 
                            draggable={true}
                            key={index} 
                            className='task' 
                            onDragStart={(e) => onDragStartHandler(e, task)}
                            onClick={() => console.log(1)}
                        >
                            {task.task}
                        </div>
                    ))
                }
            </div>
            <form style={{display: showForm ? 'block': 'none'}} onSubmit={onCreateCardHandler} className='add-card-form'>
                <div className="input-container">
                    <input placeholder='Введите новое задание' className='newTask' onChange={(e) => setNewTask(e.target.value)} value={newTask}/>
                </div>
            </form>
            <div className="add-card">
                <button onClick={() => setShowForm(true)} style={{display: showForm ? 'none' : 'flex'}}>
                    <p>+</p>
                    <p>Добавить карточку</p>
                </button>
                <button style={{display: showForm ? 'block' : 'none'}}>Добавить</button>
                <button style={{display: showForm ? 'block' : 'none'}} onClick={() => setShowForm(false)}>X</button>
            </div>
        </div>
    );
}