function createName(edit = false) {
    let name = localStorage.getItem("ChatAppName");
    if (!name) {
        let randomId = `User-${1000 + Math.floor(Math.random() * 9000)}`;
        name = prompt("Enter Your Name", randomId);
        if (name === null || name === "") name = randomId;
        localStorage.setItem("ChatAppName", name);
    } else if (edit) {
        let previousName = name;
        name = prompt("Enter New Name", previousName);
        if (name === null) name = previousName;
        localStorage.setItem("ChatAppName", name);
        socket.emit("edit-MyName", name, previousName);
    }
    return name;
}
const socket = io();
let name = createName();
socket.emit("give-MyName", name);
const sendbtn = document.getElementById("send");
const msgInput = document.getElementById("msg");
const messagesEl = document.getElementById("messages");
const editBtn = document.querySelector(".editName");
const usersEl = document.querySelector(".userWork");
const msgForm = document.querySelector(".msgForm");

function createMsgEl(message) {
    let msg = message.split("!@#$")[0];
    let username = message.split("!@#$")[1];
    let msgEl = document.createElement("div");
    let usernameEl = document.createElement("span");
    if (username === name) {
        usernameEl.style.color = "rgb(60, 60, 255)";
        username += " (You)";
    } else {
        usernameEl.style.color = "red";
    }
    usernameEl.innerText = username + ":- ";
    usernameEl.className = "userName";
    msgEl.appendChild(usernameEl);
    msgEl.className = "message";
    msgEl.innerHTML += msg;
    messagesEl.append(msgEl);
}

function createUserEl(username, index) {
    let userEl = document.createElement("div");
    userEl.className = "user";
    userEl.innerText = `${index}. ${username}`;
    usersEl.append(userEl);
}

function emptyUsersEl() {
    usersEl.querySelectorAll("div").forEach(div => div.remove());
}
editBtn.addEventListener("click", ()=> {
    name = createName(true);
})
msgForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (msgInput.value.trim() === "") return;
    const msg = msgInput.value + `!@#$${name}`;
    msgInput.value = '';
    socket.emit("user-message", msg);
});

socket.on("message", message => {
    createMsgEl(message);
})
socket.on("usernames", names => {
    emptyUsersEl();
    for (let i = 0; i < names.length; i++) {
        createUserEl(names[i], i + 1);
    }
});
