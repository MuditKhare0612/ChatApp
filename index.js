const http = require("http");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function splitData(data) {
    data = data.split("\n");
    data.pop();
    return data;
}

io.on("connection", socket => {
    console.log("a new User connected");
    socket.on("user-message", message => {
        io.emit("message", message);
    })
    socket.on("give-MyName", name => {
        fs.readFile("./public/users.txt", "utf-8", function(err, data) {
            if (err) console.error(err);
            data = splitData(data);
            let index = data.indexOf(name);
            if (index === -1) {
                data.push(name + "\n");
                fs.appendFile("./public/users.txt", name + "\n", "utf-8", function(err) {
                    if (err) console.error(err);
                    io.emit("usernames", data);
                    socket.username = name;
                })
            } else io.emit("usernames", data);
        })
    });
    socket.on("edit-MyName", (finalName, previousName) => {
        fs.readFile("./public/users.txt", "utf-8", function(err, data) {
            if (err) console.error(err);
            data = splitData(data);
            let index = data.indexOf(previousName);
            if (index === -1) return;
            data[index] = finalName;
            dataString = data.join("\n") + "\n";
            fs.writeFile("./public/users.txt", dataString, "utf-8", function(err) {
                if (err) console.error(err);
                io.emit("usernames", data);
                socket.username = finalName;
            })
        })
    })
    socket.on("disconnect", reason => {
        let name = socket.username;
        fs.readFile("./public/users.txt", "utf-8", (err, data) => {
            if (err) console.error(err);
            data = splitData(data);
            nameIndex = data.indexOf(name);
            if (!(nameIndex === -1)) data.splice(nameIndex, 1);
            dataString = data.join("\n");
            fs.writeFile("./public/users.txt", dataString, "utf-8", function(err) {
                if (err) console.error(err);
                io.emit("usernames", data);
            })
        })
    })
})

fs.writeFile("./public/users.txt", "", "utf-8", function(err) {
    if (err) console.error(err);
})

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/:path", function(req, res) {
    res.send(`404 Not found: ${req.url}`);
});

server.listen(3000, function() {
    console.log("Server Started link: http://localhost:3000/");
});