const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

 
//put your key like this const  API_KEY = "YOUR_KEY_HERE"
let userText = null;
const API_KEY ="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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>ASK AI</>
                            <p>Start any conversation and explore the power of AI.<br> Your chat history will be displayed here.<p/>                    
                        <div/>`


    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createElement = (html, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv; // Return the created chat div
}

loadDataFromLocalstorage();

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

// Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
    body: JSON.stringify({
     model: "text-davinci-003",
     prompt: "userText",
     max_tokens: 2048,
     temperature: 0.2,
     n: 1,
     stop: null
        })
    }

    //send POST request to AP1, get response and set the response as paragraph element text

    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch(error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. please try again later.";
    }
    //remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);

}

const copyResponse = (copyBtn) => {
    // copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p")
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent= "done";
    setTimeout(() => copyBtn.temperature = "content_copy, 1000");
}

const showTypingAnimation = () => {

    const html = `<div class="chat-content">
                    <div class="chat-details">
                    <img src="img/ChatGPT_logo.svg.png" alt="chatbot-img">
                    <div class="typing-animation">
                        <div class="typing-dot" style="--delay: 0.2s"></div>
                        <div class="typing-dot" style="--delay: 0.3s"></div>
                        <div class="typing-dot" style="--delay: 0.4s"></div>
                    </div>
                </div>
                <span onclick="copyResponse(this)" class="material-symbols-outlined">content_copy</span>
            </div>`;


            // create an incoming chat div with user's message and append it to chat container
    const incomingChatDiv = createElement(html, "incoming");  
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); //Get chatInput value and remove extra spaces
    if(!userText) return; // if chatInput is empty return from here

    chatInput.value = "";
    chatInput.style.height = `=${initialHeight}px`;

    const html =  `<div class="chat-content">
    <div class="chat-details">
        <img src="img/me.png" alt="user-img">
        <p></p>
    </div>
</div> `;

            // create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createElement(html, "outgoing"); 
    outgoingChatDiv.querySelector("p").textContent = userText; 
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);        
      

}

themeButton.addEventListener("click", () => {
    //Toggle body's class for the theme mode and save the updated theme to the local storage
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    //Remove all chats from local storage and call loadDataFromLocalstorage function
        if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydowm", (e) => {

    //if the Enter key is pressed without Shift + window width is larger
    // than 800 px, handle the outgoing chat
  if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.parentDefault();
    handleOutgoingChat();
  }
});

sendButton.addEventListener("click", handleOutgoingChat);
