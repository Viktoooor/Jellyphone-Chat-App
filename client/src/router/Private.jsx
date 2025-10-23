import { Routes, Route, Navigate } from "react-router-dom"
import ChatApp from "../pages/Chat/Chat"
import Test from "../pages/Test/Test"

const Private = () => {
    return (
        <Routes>
            <Route element={<ChatApp/>} path="/chat"/>
            <Route element={<Test/>} path="/"/>
            <Route
                path="*"
                element={<Navigate to="/chat" replace />}
            />
        </Routes>
    )
}

export default Private