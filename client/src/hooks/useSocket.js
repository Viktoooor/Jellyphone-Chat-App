import { useState, useEffect, useCallback } from "react";
import { wsClient } from "../service/wsService/wsClient";
import { useStore } from "../store/store";

export const useSocket = () => {
    const setInitialData = useStore(state => state.setChatData)
    const initListeners = useStore(state => state.initSocketListeners)
    const removeListeners = useStore(state => state.removeSocketListeners)

    // idle | connecting | loading | ready | error
    const [status, setStatus] = useState("idle")

    const fetchInitialData = useCallback(async () => {
        try{
            setStatus("loading")
            const res = await wsClient.request("get_data", {})
            setInitialData(res)
            initListeners()
            setStatus("ready")
        }catch(e){
            setStatus("error")
        }
    }, [setInitialData, initListeners])

    useEffect(() => {
        setStatus("connecting")
        wsClient.connect(import.meta.env.VITE_WS_URL)

        const onOpen = () => {
            fetchInitialData()
        }
        const onClose = () => {
            setStatus("idle")
            removeListeners()
        }
        const onError = (e) => {
            setStatus("error")
        }

        wsClient.on("open", onOpen)
        wsClient.on("close", onClose)
        wsClient.on("error", onError)

        return () => {
            wsClient.off("open", onOpen)
            wsClient.off("close", onClose)
            wsClient.off("error", onError)
            wsClient.disconnect()
            removeListeners()
        }
    }, [fetchInitialData, removeListeners])

    return {
        ready: status === 'ready',
        status
    }
}