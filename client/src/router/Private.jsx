import { Routes, Route, Navigate } from "react-router-dom"
import ChatApp from "../pages/Chat/Chat"

const Private = () => {
    return (
        <Routes>
            <Route element={<ChatApp/>} path="/chat"/>
            <Route
                path="*"
                element={<Navigate to="/chat" replace />}
            />
        </Routes>
    )
}

export default Private