import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
console.log('console any changes')
// VARIABLES
const mainBotView = document.getElementById('bot-view');
let user = {};
let chatSession = {};
let chatArray = [];
let send_disabled = false;
let dur = ''
// CHECK USER
async function checkUser() {
    const chatView = document.getElementById('chat-view')
    const registerView = document.getElementById('register-view')
    user = JSON.parse(localStorage.getItem("user"))
    if (!!user) {
        chatView.classList.remove('hidden')
        registerView.classList.add('hidden')
        try {
            const payload = {
                entity: user?.entity,
                user_id: user?.id
            }
            const res = await axiousRequestPromise({ method: 'post', url: `https://api.poc.uktob.ai/v1/users/chat-session/create`, body: { ...payload } })
            if (res) {
                chatSession = res?.data?.chat_session
            }
        } catch (error) {
            console.log("err>>>>>>>", error)
        }
    } else {
        chatView.classList.add('hidden')
        registerView.classList.remove('hidden')
    }
}
checkUser()

function checkItems() {
    if (chatArray.length) {
        document.getElementById('initial-message').classList.add('hidden')
    }
}


// MAIN BUTTON EVENTS
const mainBtn = document.getElementById('main-button')
mainBtn.addEventListener('click', () => {
    mainBotView.classList.remove('hidden')
})

// CLOSE CHAT EVENT
const closeBtn = document.getElementById('close-chat')
closeBtn.addEventListener('click', () => {
    mainBotView.classList.add('hidden')
});

// REQUEST PROMISE 
async function axiousRequestPromise({ method, url, body, headers }) {
    return new Promise(async (resolve, reject) => {
        const headerObj = {
            Accept: "*/*",
            ...headers,
        };
        const options = {
            headers: headerObj,
        }

        try {
            let res;
            if (method.toLowerCase() === "get" || method.toLowerCase() === "delete") {

                res = await axios[method.toLowerCase()](url, options);

            } else {
                res = await axios[method.toLowerCase()](url, body, options);
            }
            resolve(res);
        } catch (error) {
            console.log("err--", error);
            reject(error)
        }
    })
}
// REGISTER A USER EVENTS
let username = '';
let userEmail = '';
let loading = false


async function handleSubmit() {
    const nameInput = document.getElementById('name-input');
    username = nameInput.value
    const emailInput = document.getElementById('email-input');
    userEmail = emailInput.value
    loading = true;
    let firstName = username;
    let lastName = ' '
    if (username.includes(" ")) {
        firstName = username.split(" ")[0]
        lastName = username.split(' ')[1]
    }

    const payload = {
        entity: 'testing',
        first_name: firstName,
        last_name: lastName,
        email: userEmail
    }
    try {
        const res = await axiousRequestPromise({ method: 'post', url: `https://api.poc.uktob.ai/v1/users/register`, body: { ...payload } })
        if (res) {
            localStorage.setItem("user", JSON.stringify(res?.data?.user));
            user = res?.data?.user
            checkUser()
            loading = false
            console.log("user>>>>>>>", user)
        }

    } catch (error) {
        loading = false
        console.log("error>>>>>>>", error)
    }
}
const registerBtn = document.getElementById('start-chat');
registerBtn.addEventListener('click', () => {
    handleSubmit()
})

// TRIGGER CHAT EVENTS
async function handleChat() {
    if (send_disabled) {
        return;
    }
    send_disabled = true;
    let promptElement = document.getElementById('your-prompt')
    let prompt = promptElement.value
    chatArray.push({ content: prompt, created_at: new Date() })
    promptElement.value = ''
    updateChatList({ content: prompt, created_at: new Date() })
    checkItems()
    try {
        const payload = {
            entity: chatSession?.entity,
            user_id: chatSession?.user_id,
            chat_session_id: chatSession?.id,
            type: 1,
            message: prompt
        }
        const chatRes = await axiousRequestPromise({ method: 'post', url: `https://api.poc.uktob.ai/v1/chat-agent/run`, body: { ...payload } })
        if (chatRes) {
            updateChatList(chatRes?.data)
            send_disabled = false;

        }
    } catch (error) {
        console.log("error>>>>>>", error)
        send_disabled = false;

    }
}
const chatBtn = document.getElementById('trigger-chat');
chatBtn.addEventListener('click', () => {
    handleChat()
})

// UPDATE CHAT LIST
function updateChatList(item) {
    const chatList = document.getElementById('chat-list');

    const newItem = createChatListItem(item);
    chatList.appendChild(newItem);
    chatList.lastChild?.scrollIntoView(false);
}
//    CHAT LIST ITEM
function createChatListItem(item) {
    let waveform_id = ("waveform" + ("" + Math.random()).substring(2, 8));
    const listItem = document.createElement('li');
    const responsItem = `<div className='w-full max-w-[310px]'>
    <div class='flex items-end gap-x-2 w-full'>
        <span>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_5_5209" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
        <path d="M28 0H0V28H28V0Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_5_5209)">
        <path d="M26.8877 25.1636C26.313 24.2921 25.9035 23.3224 25.6793 22.3027C25.6509 22.1795 25.6473 22.0519 25.6685 21.9273C25.6897 21.8026 25.7353 21.6834 25.8028 21.5766C27.2448 19.2849 28.0057 16.6301 27.9969 13.9219C27.9797 10.2214 26.4977 6.67847 23.8756 4.06908C21.2535 1.45969 17.7049 -0.00347623 14.007 6.20207e-06H13.9201C10.2097 0.0115447 6.65594 1.49761 4.04049 4.13127C1.42504 6.76494 -0.0378297 10.3305 -0.0262995 14.0435C-0.0147694 17.7565 1.47021 21.3129 4.10197 23.9303C6.73373 26.5476 10.2967 28.0115 14.007 28H14.081C16.0329 27.9886 17.9616 27.5756 19.7473 26.7867C19.9391 26.7021 20.155 26.69 20.3551 26.7526C21.3737 27.0568 22.4312 27.211 23.4942 27.2104H23.5495C24.4695 27.2069 25.3849 27.0808 26.2717 26.8355C26.5495 26.758 26.7858 26.5746 26.93 26.3246C27.0742 26.0747 27.1147 25.7781 27.0429 25.4986C27.0117 25.3772 26.9592 25.2624 26.8877 25.1595M24.5668 25.3571C23.269 25.5188 21.9513 25.382 20.7143 24.957C20.2256 24.7871 19.6897 24.8163 19.2223 25.0383C17.6109 25.7991 15.8521 26.1961 14.0704 26.2012H14.007C10.7712 26.211 7.66411 24.9341 5.36914 22.6513C3.07418 20.3686 1.77937 17.267 1.76956 14.0289C1.75976 10.7908 3.03576 7.68136 5.31686 5.38473C7.59796 3.0881 10.6973 1.79235 13.9331 1.78253H14.007C16.2202 1.77983 18.3925 2.37974 20.2911 3.51797C22.1897 4.65621 23.7431 6.2899 24.7848 8.24402C25.8266 10.1981 26.3175 12.3991 26.205 14.611C26.0924 16.823 25.3806 18.9627 24.1459 20.8008C23.8514 21.2323 23.739 21.7627 23.8331 22.2767C24.0084 23.2303 24.3175 24.1543 24.7513 25.0213C24.7691 25.0551 24.7783 25.0927 24.7781 25.131C24.7779 25.1692 24.7682 25.2067 24.7499 25.2403C24.7317 25.2739 24.7054 25.3024 24.6735 25.3234C24.6415 25.3443 24.6049 25.357 24.5668 25.3604" fill="#4285F4"/>
        </g>
        <path d="M13.0938 1.08325L9.28101 2.19977L5.43095 4.05386L3.60824 6.57477L1.30859 10.0764V16.4868L2.20244 19.6152L4.33226 23.1559L6.64331 24.5302L9.2827 26.3908L12.5884 27.1527H16.8472L19.6255 25.6995H20.6559L23.4764 26.3908L25.2642 25.6995H25.9956L25.2642 23.1559L24.2997 21.7311L25.9956 18.6751L27.1397 14.1212V11.5402L25.9956 8.13611L24.2997 5.59975L19.628 2.20059L16.848 1.08325H13.0938Z" fill="#4285F4"/>
        <mask id="mask1_5_5209" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="5" y="8" width="18" height="12">
        <path d="M22.9442 8.07495H5.05469V19.9273H22.9442V8.07495Z" fill="white"/>
        </mask>
        <g mask="url(#mask1_5_5209)">
        <path d="M5.09814 12.1404V15.9388C5.09814 16.9851 5.51346 17.9884 6.25272 18.7282C6.99198 19.468 7.99463 19.8836 9.0401 19.8836H10.7287V18.0661H9.21319C8.64228 18.0661 8.09476 17.8392 7.69107 17.4352C7.28738 17.0312 7.06059 16.4833 7.06059 15.912V12.1404H5.09814Z" fill="white"/>
        <path d="M22.8981 15.8612V12.0627C22.8981 11.0165 22.4828 10.0131 21.7436 9.27333C21.0043 8.53353 20.0016 8.11792 18.9562 8.11792H17.2676V9.93541H18.7839C19.3548 9.93541 19.9023 10.1624 20.306 10.5664C20.7097 10.9703 20.9365 11.5183 20.9365 12.0896V15.8612H22.8981Z" fill="white"/>
        <path d="M12.9807 11.991H11.1646V16.0114H12.9807V11.991Z" fill="white"/>
        <path d="M16.906 11.991H15.0898V16.0114H16.906V11.991Z" fill="white"/>
        </g>
        </svg>
        
        </span>
        <div class='px-4 py-2 bg-[#F2F3F6] rounded-t-[8px] rounded-br-[8px]'>
            <div class='text-[14px] text-[#495160] leading-[22px]'>
                <p>${item.content}</p>
            </div>
        </div>

    </div>
    <p class='pt-2 pl-9 text-[10px] text-[#495160] font-semibold font-open-sans text-left'>
        ${formatDateTime(new Date())}
    </p>
</div>`
    const actionItem = `<div class='w-full max-w-[310px]'>
<div class='w-full flex items-end gap-x-2'>
    <div class='px-4 py-2 bg-[#F2F3F6] rounded-t-[8px] rounded-bl-[8px] flex-1'>
    ${!item?.audioFile ? `<p class='text-[14px] text-[#495160] leading-[22px]'>
    ${item?.content}
</p>` : `<div class="">
<div class="flex items-center gap-x-1">
    <div class="waveContainer w-full ">
        <div id=${waveform_id} class="no-scrollbar h-[30px]" ></div>
    </div>
    <div
        class='cursor-pointer flex items-center gap-x-1 '
    >
        <span class="text-[10px] font-bold">${dur ?? "-"}</span>
        
            <span id="pause-audio" class="hidden">
                <div class="w-6 h-6 rounded-full flex justify-center items-center bg-[#DB4437]">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-pause-filled" width="14" height="14" viewBox="0 0 24 24" stroke-width="1" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" stroke-width="0" fill="white" />
                <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" stroke-width="0" fill="white" />
            </svg>
                </div>
            </span>

        
            <span id="play-audio">
            <svg width='24' height='24' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx='12' cy='12' r='12' fill="#DB4437" />
            <path d="M9.33301 16.6168V7.28345L16.6663 11.9501L9.33301 16.6168Z" fill="white" />
        </svg>
            </span>
    </div>
</div>
</div>`}
        
    </div>
    <div class='w-7 h-7 bg-[#0F1E36] flex justify-center items-center rounded-[8px] text-white font-oxygen uppercase'>
        ${user?.first_name[0]}
    </div>
</div>
<p class='pt-2 pr-9 text-[10px] text-[#495160] font-semibold font-open-sans text-right'>
    ${formatDateTime(new Date())}
</p>
</div>`

    if (item?.sender == 2) {
        listItem.classList.add('w-full', 'flex', 'justify-start')
        const dummyItem = document.createElement('li');

        dummyItem.innerHTML = responsItem;
        // rawHTML=listItem;
        listItem.appendChild(dummyItem);
    } else {
        listItem.classList.add('w-full', 'flex', 'justify-end')
        listItem.innerHTML = actionItem;
    }
    setTimeout(() => {
        if (item?.audioFile) {
            const waveformContainer = document.getElementById(waveform_id);
            const playButton = listItem.querySelector('#play-audio');
            const pauseButton = listItem.querySelector('#pause-audio');
            // Initialize Wavesurfer
            const wavesurfer = WaveSurfer.create({
                container: waveformContainer,
                waveColor: "#CECED6",
                progressColor: "#4283F2",
                cursorColor: "transparent",
                barWidth: 3,
                barRadius: 3,
                responsive: true,
                height: 29,
                normalize: true,
                partialRender: true,
                fillParent: true,
            });
            // Load audio for Wavesurfer
            wavesurfer.load(item?.audioFile);

            playButton.addEventListener('click', () => {
                wavesurfer.play();
                playButton.style.display = 'none';
                pauseButton.style.display = 'block';
            });

            pauseButton.addEventListener('click', () => {
                wavesurfer.pause();
                pauseButton.style.display = 'none';
                playButton.style.display = 'block';
            });
        }
    }, 2000);
    return listItem;
}

function formatDateTime(dateTimeString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', options);
}

// MIC RECORDING EVENTS
let mediaRecorder;
let audioChunks = [];
const startRecordingButton = document.getElementById('play-recording');
const stopRecordingButton = document.getElementById('stop-recording');

startRecordingButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                addAudioElement(audioBlob)
                const audioUrl = URL.createObjectURL(audioBlob);

            };

            mediaRecorder.start();
            startRecordingButton.classList.add('hidden')
            stopRecordingButton.classList.remove('hidden')
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
});

stopRecordingButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordingButton.classList.remove('hidden')
    stopRecordingButton.classList.add('hidden')
});

async function addAudioElement(blob) {
    const url = URL.createObjectURL(blob);
    let file = new File([blob], 'test.mp3', { type: 'audio/mpeg' });
    chatArray.push({ content: '', audioFile: url, audioBlob: blob, created_at: new Date() })
    updateChatList({ content: '', audioFile: url, audioBlob: blob, created_at: new Date() })
    checkItems()

    var formdata = new FormData();
    formdata.append("entity", "testing");
    formdata.append("user_id", chatSession?.user_id);
    formdata.append("chat_session_id", chatSession?.id);
    formdata.append("type", "2");
    formdata.append("message", "hello. How are you? What is your name?");
    formdata.append("audio", file, 'audio.mp3')
    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };
    fetch("https://api.poc.uktob.ai/v1/chat-agent/run", requestOptions)
        .then(response => response.json())
        .then(result => {
            updateChatList(result)

        })
        .catch(error => {

            console.log("error>>>>>>", error)
        });

};
