import { io } from 'socket.io-client'

const socket = io('http://localhost:4000', {
    autoConnect: true,
    extraHeaders: {
        'Access-Control-Allow-Origin': '*'
    }
})

socket.on('connect', () => {
    console.log('WebSocket connected successfully')
})

socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason)
})

socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error)
    if (socket.io.opts.transports.includes('websocket')) {
        console.log('Falling back to polling transport')
        socket.io.opts.transports = ['polling']
        socket.connect()
    }
})

socket.on('reconnect', (attemptNumber) => {
    console.log('WebSocket reconnected after', attemptNumber, 'attempts')
})

socket.on('reconnect_error', (error) => {
    console.error('WebSocket reconnection error:', error)
})

socket.on('reconnect_failed', () => {
    console.error('WebSocket reconnection failed')
})

export const checkConnection = () => {
    return socket.connected
}

export const connect = () => {
    if (!socket.connected) {
        socket.connect()
    }
}

export const disconnect = () => {
    if (socket.connected) {
        socket.disconnect()
    }
}

export default socket