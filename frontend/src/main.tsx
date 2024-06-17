import { DrawingProvider } from '@/context/DrawContext.tsx';
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App, {loader as appLoader} from './App.tsx'
import './index.css'


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


ReactDOM.createRoot(document.getElementById('root')!).render(
  <DrawingProvider>
    <RouterProvider router={router} />
  </DrawingProvider>
)
