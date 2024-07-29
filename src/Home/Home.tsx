import { Column } from '../Column/Column'
import './Home.scss'

export const Home = () => {
    return(
        <div className='home'>
            <Column tableName={'To Do'} type={'todo'}/>
            <Column tableName={'In Process'} type={'in process'}/>
            <Column tableName={'Done'} type={'done'}/>
        </div>
    )
}