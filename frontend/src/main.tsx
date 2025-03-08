import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Rooms from './components/Rooms';
import Chat from './components/Chat';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Register from './components/Register';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
      <Route path="/rooms/:uId" element={<Rooms />}></Route>
      <Route path="/chat/:cId" element={<Chat />}></Route>
      <Route path="/*" element={<NotFound />}></Route>
    </>
  )
);

createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <RouterProvider router={router}/>
    <ToastContainer position='top-right' autoClose={2000}/>
  </RecoilRoot>
)
