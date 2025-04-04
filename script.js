// DOM Elements
const promptForm = document.querySelector(".prompt-form")
const promptInput = promptForm.querySelector(".prompt-input")
const chatsContainer = document.querySelector(".chats-container")
const container = document.querySelector(".container")
const fileInput = promptForm.querySelector("#file-input")
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper")
const themeToggle = document.querySelector("#theme-toggle-btn") 


const API_KEY = "AIzaSyDh_-i72kiAd7-L7rGapuvDa4Wzi4EEUj8" 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

let typingInterval, controller
const chatHistory = []
const userData = { message: "", file: {} }


const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div")
  div.classList.add("message", ...classes)
  div.innerHTML = content
  return div
}

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })


const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = ""
  const words = text.split(" ")
  let wordIndex = 0

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++]
      scrollToBottom()
    } else {
      clearInterval(typingInterval)
      botMsgDiv.classList.remove("loading")
      document.body.classList.remove("bot-responding")
    }
  }, 40)
}

const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text")
  controller = new AbortController()

  // Add user message to chat history
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }] : []),
    ],
  })

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.error?.message || "Failed to get response")

    const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim()
    typingEffect(responseText, textElement, botMsgDiv)

    // Add bot response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: responseText }],
    })
  } catch (error) {
    textElement.style.color = "#d62939"
    textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : `Error: ${error.message}`
    botMsgDiv.classList.remove("loading")
    document.body.classList.remove("bot-responding")
  } finally {
    userData.file = {}
  }
}

const handleFormSubmit = (e) => {
  e.preventDefault()
  const userMessage = promptInput.value.trim()

  if (!userMessage || document.body.classList.contains("bot-responding")) return

  promptInput.value = ""
  userData.message = userMessage
  document.body.classList.add("bot-responding")
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached")

  // Generate user message HTML and add to the chats container
  const userMsgHTML = `
        <p class="message-text"></p>
        ${
          userData.file?.data
            ? userData.file.isImage
              ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" alt="User uploaded image" />`
              : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
            : ""
        }
    `

  const userMsgDiv = createMsgElement(userMsgHTML, "user-message")
  userMsgDiv.querySelector(".message-text").textContent = userMessage
  chatsContainer.appendChild(userMsgDiv)
  scrollToBottom()

  // Add bot response after a short delay
  setTimeout(() => {
    const botMsgHTML =
      '<img src="logo.png" class="avatar" alt="Gemini logo"><p class="message-text">just a sec...</p>'
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading")
    chatsContainer.appendChild(botMsgDiv)
    scrollToBottom()
    generateResponse(botMsgDiv)
  }, 600)
}


fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]
  if (!file) return

  const isImage = file.type.startsWith("image/")
  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = (e) => {
    fileInput.value = ""
    const base64String = e.target.result.split(",")[1]
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached")

    userData.file = {
      fileName: file.name,
      data: base64String,
      mime_type: file.type,
      isImage,
    }
  }
})

// Event Listeners
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {}
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached")
})

document.querySelector("#stop-response-btn").addEventListener("click", () => {
  controller?.abort()
  clearInterval(typingInterval)
  const loadingMessage = document.querySelector(".bot-message.loading")
  if (loadingMessage) {
    loadingMessage.classList.remove("loading")
  }
  document.body.classList.remove("bot-responding")
})

document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0
  chatsContainer.innerHTML = ""
  document.body.classList.remove("bot-responding")
})

themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme")
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode")
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode"
})

// Add click event listeners to suggestion items
document.querySelectorAll(".sugitem").forEach((item) => {
  item.addEventListener("click", () => {
    const text = item.querySelector(".text").textContent
    promptInput.value = text
    promptForm.dispatchEvent(new Event("submit"))
  })
})

// Initialize theme from localStorage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode"
document.body.classList.toggle("light-theme", isLightTheme)
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode"

// Event listener for form submission
promptForm.addEventListener("submit", handleFormSubmit)
document.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click())

