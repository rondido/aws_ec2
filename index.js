const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");   // cors

// socket.io를  import, 첫 번째 매개변수는 server, 두 번째 매개변수는 옵션 객체
const io = require("socket.io")(server, {
    cors: {
        origin: "*",    // 허락하고자 하는 요청 주소
        methods: ["GET", "POST"],  
    }
});
app.use(express.static('public'));

// config 추가
app.use(cors());    

// PORT 지정
const PORT = process.env.PORT || 5000;  

// route 지정, 누군가 서버에 방문하면 아래 메시지가 전송됨
app.get("/", (req,res) => {
    res.render('index');
})

app.use(express.static('public'));

// socket.on('이벤트 명', Callback Function) : 해당 이벤트를 받고 콜백함수를 실행합니다.
// socket.emit('이벤트 명', Data) : 이벤트 명을 지정하고 데이터를 보냅니다.
io.on("connection", (socket) => {   // 'connection'이벤트를 받고, callBack 함수를 실행
	socket.emit("me", socket.id);   // emit()으로 'me'라는 이름의 이벤트 명으로 지정, 뒤에는 socket.id를 보냄

	socket.on("disconnect", () => { // 연결 헤제 메서드
		socket.broadcast.emit("callEnded")  // 호출 종료 작업을 실행하는 곳
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => { 
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));