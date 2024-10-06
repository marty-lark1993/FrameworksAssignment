const socketIO = require("socket.io");

const setupSocketIO = (server) => {
    const io = socketIO(server);

    io.on("connection", (socket) => {
        console.log("A user connected: ", socket.id);

        socket.on("joinChannel", (channelId) => {
            socket.join(channelId);
            console.log(`User joined channel: ${channelId}`);
        });

        socket.on("sendMessage", (message) => {
            const { channelId, text, userId } = message;
            io.to(channelId).emit("receiveMessage", { text, userId });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
        });
    });
};

module.exports = setupSocketIO;