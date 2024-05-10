const socket = io.connect("localhost:8081") //https://qtr4b-donsimon.amvera.io

socket.on("connect", () => {
	console.log("Connected")
})

socket.on('connect_error', function(err) {
	$('#users_online').text('🟢 Online: Connect error')
})

var chatParms = new Object()
var chatParms = {
	commands_show: false,
	stick_show: false,
	settings_show: false,
	ping_date: ''
}

function createMessage(username, message, nick_color){
	if (nick_color == "color" || nick_color == ""){
		$('#messages').append(`<p><strong>${username}:</strong> ${message}</p>`)
		$('#messages').scrollTop($('#messages p:last').offset().top)

	} else {
		$('#messages').append(`<p><strong style="color: ${nick_color};">${username}:</strong> ${message}</p>`)
		$('#messages').scrollTop($('#messages p:last').offset().top)
	}
}

// Connect user
socket.on("connected", (data) => {
	$('#users_online').text(`🟢 Online: ${data.users}`)
	$('#messages').scrollTop($('#messages p:last').offset().top)
})

// Load messages
socket.on("load_messages", (data) => {
	$('#messages').html(data.messages)
	$('#messages').scrollTop($('#messages p:last').offset().top)
})

// Disconnect
socket.on("disconnected", (data) => {
	$('#users_online').text(`🟢 Online: ${data.users}`)
	createMessage("Server", `<i>${data.id}</i> Вышел из чата`)
	$('#messages').scrollTop($('#messages p:last').offset().top)
})

socket.on("new_message", (data) => {
	createMessage(data.username, data.message, data.nc)
})

socket.on("sticker_back", (data) => {
	createMessage(data.name, data.text, data.nc)
})

socket.on("ping_back", (data) => {
	var ndate = new Date().getTime()
	var ping = ndate - chatParms.ping_date
	socket.emit('new_message', {username: 'Server', message: `${data.author}, ${ping}ms`, nc: '#C7C7C7'})
})

socket.on("clear_back", (data) =>{
	function clearChat(){
		$('#messages').empty();
		createMessage(data.author, 'Очистил чат')
	}

	socket.emit("new_message", {username: 'Server', message: 'Через 3 секунды произойдет очистка чата', nc: '#C7C7C7'})
	setTimeout(() => clearChat(), 3000)
})


function MessageSend(){
	var message = $('#message').val()
	$('#message').val('')
	var nc = $('#nc').val()
	var username = $('#username').val()

	if (username == ""){
		username = "Anon"
	}

	// Clear
	if (message == "/clear"){
		var password = prompt('А ты Админ??', "Пароль")
		socket.emit("cmd_clear", {password: password, author: username})

	// Ping
	} else if (message == "/ping"){
		chatParms.ping_date = new Date().getTime()
		socket.emit("cmd_ping", {author: username})
		socket.emit("new_message", {username: username, message: message, nc: nc})

	// Send message
	} else { 
		socket.emit('new_message', {username: username, message: message, nc: nc})
	}
}

function stickerSend(stick){
	var nc = $('#nc').val()

	var username = $('#username').val()
	if (username == ""){
		username = "Anon"
	}

	socket.emit("sticker_send", {author: username, name: stick, nc: nc})
}


function commandsClick(){
	if (chatParms.commands_show == false){
		$('#commands_list').attr({'hidden': false})
		chatParms.commands_show = true

	} else if (chatParms.commands_show == true){
		$('#commands_list').attr({'hidden': true})
		chatParms.commands_show = false
	}
}

function stickClick(){
	if (chatParms.stick_show == false){
		$('#stickers').attr({'hidden': false})
		chatParms.stick_show = true

	} else if (chatParms.stick_show == true){
		$('#stickers').attr({'hidden': true})
		chatParms.stick_show = false
	}
}

function settingsClick(){
	if (chatParms.settings_show == false){
		$('#settings').css({'z-index': 1000, 'opacity': 1})
		chatParms.settings_show = true

	} else if (chatParms.settings_show == true){
		$('#settings').css({'z-index': 0, 'opacity': 0})
		chatParms.settings_show = false
	}
}

$(document).bind('keyup', function(event){
	if (event.key == "Enter"){
		MessageSend()
	} else {
		return
	}
})
