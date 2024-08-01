import ReactDOM from 'react-dom/client'
import './Shared/styles/index.scss'
import App from './Pages/app/App'
import { EditorContextProvider } from '@/Features/Editor/EditorContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <EditorContextProvider>
        <App />
    </EditorContextProvider>
)
