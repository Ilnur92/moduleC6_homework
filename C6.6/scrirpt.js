
/**
 * @description класс для работы с отображением логов в элементе #log
 */
class Log {
  constructor() {
    this.logElement = document.getElementById("log");
  }
  clear() {
    while (this.logElement.firstChild) {
      this.logElement.removeChild(this.logElement.firstChild);
    }
  }
  insert(text) {
    this.logElement.insertAdjacentHTML("beforeend", `<p>${text}</p>`);
  }
}
const log = new Log();

/**
 * @description проверка доступности Geo Location и WebSocket
 */
function initialize() {
  if (!("geolocation" in navigator)) {
    let str = "- Geolocation not allowed!";
    log.insert(str);
    buttonGeo.remove();
    buttonGeo = false;
  }
  if (!window.WebSocket) {
    let str = "- WebSocket not allowed!";
    log.insert(str);
    buttonSend.remove();
    context.disabled = true;
    buttonSend = false;
  } else {
    initSocket();
  }
}

let buttonSend = document.getElementById("btnSend");
let buttonGeo = document.getElementById("btnGeo");
const context = document.getElementById("context");

if (!!buttonGeo) {
  buttonGeo.addEventListener("click", () => {
    showMessage("My GEO?", "me");
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = position.coords;
      let url = `http://www.openstreetmap.org/?lat=${coords.latitude}&lon=${coords.longitude}&zoom=17&layers=M`;
      showMessage(`<a href="${url}">You position on the map</>`);
    });
  });
}

if (!!buttonSend) {
  buttonSend.addEventListener("click", () => {
    if (socket.readyState === 1) {
      const inText = document.querySelector("input");
      showMessage(inText.value, "me");
      sendEcho(inText.value);
      inText.value = "";
    } else {
      let state = { 0: "CONNECTING", 1: "OPEN", 2: "CLOSING", 3: "CLOSED" };
      let str = `WebSocket connection state is ${state[socket.readyState]}`;
      if (socket.readyState === 3 && confirm(str + "\nActivate connection?")) {
        initSocket();
      } else {
        alert(str);
      }
    }
  });
}

/**
 *
 * @param {String} text
 * @param {String} who
 * @description отображение сообщения в чате
 */
function showMessage(text, who) {
  const li = document.createElement("li");
  li.innerHTML = text;
  if (who === "me") {
    li.setAttribute("class", "mine");
  }
  context.getElementsByTagName("ol")[0].appendChild(li);
  window.scrollBy(0, window.innerHeight);
}

/**
 *
 * @param {String} text
 * @description отправка сообщение на эхо-сервер
 */
function sendEcho(text) {
  socket.send(text);
}

/**
 * @description назначение события на кнопку/принуительное закрытие соединения
 */
const close = document.getElementById("close");
close.addEventListener("click", () => {
  socket.close();
});

/**
 * @description инициализация подключения WebSocket
 */
function initSocket() {
  socket = new WebSocket("wss://echo.websocket.org/");
  socket.addEventListener("open", function (event) {
    console.log("connection opened");
  });
  socket.addEventListener("message", function (event) {
    showMessage(event.data);
  });
  socket.addEventListener("close", () => {
    console.log("close connection");
  });
  socket.addEventListener("error", function (event) {
    console.log("WebSocket error: ", event);
  });
}

window.addEventListener("load", initialize);