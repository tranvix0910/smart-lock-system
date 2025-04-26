import { io } from 'socket.io-client'

// Cấu hình chung cho socket
const socketOptions = {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['polling', 'websocket'],
    withCredentials: true,
    path: '/socket.io'
}

// Socket mặc định
const socket = io(import.meta.env.VITE_BACKEND_URL, {
    ...socketOptions,
    forceNew: true
});

// Socket cho namespace admin
const adminSocket = io(import.meta.env.VITE_BACKEND_URL + '/admin', {
    ...socketOptions,
    forceNew: true,
    auth: {
        username: 'admin',
        password: 'admin'
    }
});

// Event handlers cho socket mặc định
socket.on('connect', () => {
    console.log('WebSocket connected successfully')
})

socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason)
    // Thử kết nối lại sau 5 giây
    setTimeout(() => {
        if (!socket.connected) {
            socket.connect();
        }
    }, 5000);
})

socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error)
    // Thử lại với polling nếu websocket thất bại
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

// Event handlers cho admin socket
adminSocket.on('connect', () => {
    console.log('Admin WebSocket connected successfully')
})

adminSocket.on('connect_error', (error) => {
    console.error('Admin WebSocket connection error:', error)
    // Kiểm tra xem lỗi có phải do xác thực không
    if (error.message === 'Authentication failed') {
        console.log('Admin authentication failed - check credentials')
    }
})

adminSocket.on('disconnect', (reason) => {
    console.log('Admin WebSocket disconnected:', reason)
    // Thử kết nối lại sau 5 giây
    setTimeout(() => {
        if (!adminSocket.connected) {
            adminSocket.connect();
        }
    }, 5000);
})

// Utility functions
export const checkConnection = () => {
    return {
        default: socket.connected,
        admin: adminSocket.connected
    }
}

export const connect = () => {
    if (!socket.connected) {
        socket.connect()
    }
    if (!adminSocket.connected) {
        adminSocket.connect()
    }
}

export const disconnect = () => {
    if (socket.connected) {
        socket.disconnect()
    }
    if (adminSocket.connected) {
        adminSocket.disconnect()
    }
}

export { socket as default, adminSocket }