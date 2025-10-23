import { Routes, Route, Navigate } from "react-router-dom"
import Login from '../pages/Login'
import Register from '../pages/Register'
import Activate from '../pages/Activate'
import RegisterSuccess from "../pages/RegisterSuccess"

const Public = () => {
    return (
        <Routes>
            <Route element={<Login/>} path='/login' />
            <Route element={<Register/>} path='/signup' />
            <Route element={<Activate/>} path='/activate'/>
            <Route element={<RegisterSuccess/>} path="/registerSuccess"/>
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    )
}

export default Public