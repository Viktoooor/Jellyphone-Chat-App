import { v4 } from 'uuid'

class WSClient {
    constructor(){
        this.socket = null;
        this.url = "";

        this.listeners = new Map();
        this.pending = new Map();
        this.connectAttempts = 3;
    }

    connect(url){
        if(this.socket && this.socket.readyState === WebSocket.OPEN)
            return;

        this.url = url;

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.connectAttempts = 3;
            this.emit('open');
        };

        this.socket.onmessage = (event) => this.handleMessage(event);

        this.socket.onclose = () => {
            this.emit('close')
            this.socket = null
            if(this.connectAttempts > 0){
                this.connectAttempts--;
                setTimeout(() => {
                    this.connect(this.url)
                }, 2000)
            }
        };

        this.socket.onerror = () => {
            this.emit('error')
        };
    }

    disconnect() {
        if(this.socket && this.socket.readyState === WebSocket.OPEN){
            this.connectAttempts = 0
            this.socket.close()
        }
        this.socket = null
    }

    send(type, payload){
        const message = { type, ...payload };
        if(this.socket && this.socket.readyState === WebSocket.OPEN){
            this.socket.send(JSON.stringify(message)); 
        }else{
            console.warn("Cannot send, socket not open");
        }
    }

    request(type, payload){
        return new Promise((resolve, reject) => {
            if(!this.socket || this.socket.readyState !== WebSocket.OPEN){
                reject(new Error("WebSocket not connected"));
                return;
            } 

            const request_id = v4();
            const message = { type, ...payload, request_id };
            this.pending.set(request_id, {resolver: resolve, rejecter: reject});
            this.socket.send(JSON.stringify(message));

            // timeout fallback
            setTimeout(() => {
                if(this.pending.has(request_id)){
                    this.pending.delete(request_id);
                    reject(new Error(`Request timed out`));
                }
            }, 5000);
        });
    }

    on(event, callback){
        if(!this.listeners.has(event))
            this.listeners.set(event, []);
        this.listeners.get(event).push(callback);
    }

    off(event, callback){
        const arr = this.listeners.get(event);
        if(!arr)
            return;
        this.listeners.set(
            event,
            arr.filter(fn => fn !== callback)
        );
    }

    emit(event, payload){
        const arr = this.listeners.get(event)
        if(arr)
            arr.forEach(callback => callback(payload))
    }

    handleMessage(event){
        try{
            const msg = JSON.parse(event.data);
            const { status, type, data, request_id } = msg;

            if(request_id && this.pending.has(request_id)){
                const {resolver, rejecter} = this.pending.get(request_id);
                this.pending.delete(request_id);
                if(status == 'Bad Request' || status == 'Server Error'){
                    rejecter(new Error(data.message));
                    return;
                }
                resolver(data);
                return;
            }
            if(status == 'Bad Request' || status == 'Server Error'){
                this.emit('show_error', data.message)
                return;
            }

            this.emit(type, data);
        }catch(e){
            console.error(e);
        }
    }
}

export const wsClient = new WSClient();