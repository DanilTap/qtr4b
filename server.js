const express = require("express")
const createServer = require("http")
const Server = require("socket.io")
const axios = require('axios')
const cheerio = require("cheerio");
const fs = require("fs")

const app = express()
const httpServer = createServer.createServer(app)
const io = new Server.Server(httpServer, {})


class Chat {
	static userlist = new Map()
	static admin = 'password'

	static write(file, content, username){
		if (arguments.length == 2){
			fs.readFile(`${file}.txt`, 'utf8', (err, mdata) => {
				if (err) throw err

				var contentx = `${mdata}<p>${content}</p>\n`

				fs.writeFile(
					`${file}.txt`,
					contentx,
					'utf8',
					(err) => {
						if (err) throw err
					}
				)
			})

		} else if (arguments.length > 2){
			if (content == 'clear'){
				fs.readFile(`${file}.txt`, 'utf8', (err, mdata) => {
					if (err) throw err

					var contentx = `<strong>${username}</strong> Очистил чат\n`

					fs.writeFile(
						`${file}.txt`,
						contentx,
						'utf8',
						(err) => {
							if (err) throw err
						}
					)
				})
			}
		} 
	}

	static read(file){
		return fs.readFileSync(`${file}.txt`, 'utf8')
	}
}

app.get('/', function(req, res) {
	app.use(express.static(__dirname + "/site"))
	res.redirect("index.html")
})

io.on("connection", (socket) => {
	console.log(`Connected ${socket.id}`)
	Chat.userlist.set(socket.id, 'Anon')
	cdata = Chat.read('chat')

	socket.emit("load_messages", {messages: cdata})
	io.emit("connected", {users: JSON.stringify(Array.from(Chat.userlist))})

	socket.on("new_message", (data) => {
		console.log(`${data.username}: ${data.message}`)

		Chat.write('chat', `<strong style="color: ${data.nc}">${data.username}</strong>: ${data.message}`)
		io.emit("new_message", {username: data.username, message: data.message, nc: data.nc})
	})

	socket.on("sticker_send", (data) => {
		console.log(`${data.username}: ${data.name}`)
		var msg = ''

		if (data.name == "smiley"){
			msg = '<img style="width: 65px; height: 50px; position: relative; top: 18px;" src="./images/smiley.png" alt="">'
		} else if (data.name == "cup"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/cup.png" alt="">'
		} else if (data.name == "server"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/server.png" alt="">'
		} else if (data.name == "1c"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/1c.jpg" alt="">'
		} else if (data.name == "aue"){
			msg = '<img style="width: 55px; height: 50px; position: relative; top: 18px;" src="./images/aue.jpeg" alt="">'
		} else if (data.name == "hm"){
			msg = '<img style="width: 55px; height: 50px; position: relative; top: 18px;" src="./images/hm.png" alt="">'
		} else if (data.name == "shirik1"){
			msg = '<img style="width: 80px; height: 70px; position: relative; top: 18px;" src="./images/shirik1.png" alt="">'
		} else if (data.name == "JS"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/js.png" alt="">'
		} else if (data.name == "bandit"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/bandit.gif" alt="">'
		} else if (data.name == "cho"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/cho.png" alt="">'
		} else if (data.name == "cosoi"){
			msg = '<img style="width: 45px; height: 50px; position: relative; top: 18px;" src="./images/cosoi.gif" alt="">'
		} else if (data.name == "dirol"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/dirol.gif" alt="">'
		} else if (data.name == "hahaha"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/hahaha.png" alt="">'
		} else if (data.name == "hahaha1"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/hahaha1.gif" alt="">'
		} else if (data.name == "wall"){
			msg = '<img style="width: 80px; height: 45px; position: relative; top: 18px;" src="./images/wall.gif" alt="">'
		} else if (data.name == "thumbs_up"){
			msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/thumbs_up.gif" alt="">'
		}

		Chat.write('chat', `<strong style="color: ${data.nc}">${data.author}</strong>: ${msg}`)

		io.emit("sticker_back", {name: data.author, text: msg, nc: data.nc})
	})

	socket.on("cmd_clear", (data) => {
		if (data.password == Chat.admin){
			Chat.write('chat', 'clear', data.author)

			io.emit("clear_back", {author: data.author})
		}
	})

	socket.on("cmd_ping", (data) => {
		io.emit("ping_back", {author: data.author})
	})

	socket.on("nick_change", (data) => {
		Chat.userlist.set(data.id, data.n)
		io.emit("nick_back", {users: JSON.stringify(Array.from(Chat.userlist))})
	})

	socket.on("monitoring", (data) => {
		axios.get('https://tsarvar.com/ru/servers/counter-strike-1.6/195.2.75.58:27015')
		.then((getResponse) => {
			const html = getResponse.data
			const cheerios = cheerio.load(html);

			pcount = cheerios('.srvPage-countCur').text().trim()
			cmap = cheerios('.srvPage-mapLink').text().trim()

			io.emit("monitoring", {count: pcount, map: cmap})
		})
	})

	socket.on("disconnect", (data) => {
		console.log(`Disconnected ${socket.id}`)
		n = Chat.userlist.get(socket.id)
		Chat.userlist.delete(socket.id)

		Chat.write('chat', `<strong>Server:</strong> <i>${n}</i> Вышел из чата`)
		io.emit("disconnected", {n: n, users: JSON.stringify(Array.from(Chat.userlist))})
	})
})


httpServer.listen(8081, () => console.log('Server ready!'))