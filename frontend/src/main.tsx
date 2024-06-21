import ReactDOM from 'react-dom/client'
import App, {loader as appLoader} from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';


const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        loader: appLoader
    },
    {
        path: "/room/:roomId",
        element: <App/>,
        loader: appLoader
    },
]);


ReactDOM.createRoot(document.getElementById('root')!)
    .render(<RouterProvider router={router}/>)
