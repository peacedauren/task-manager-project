import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { EditorContextProvider } from './Editor/EditorContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <EditorContextProvider>
        <App />
    </EditorContextProvider>
)
