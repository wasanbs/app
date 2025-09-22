// --- Gemini AI Chat Feature Script ---
const geminiFab = document.getElementById('gemini-fab');
const geminiChatWindow = document.getElementById('gemini-chat-window');
const closeGeminiChat = document.getElementById('close-gemini-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');
const typingIndicator = document.getElementById('typing-indicator');
const fileInput = document.getElementById('file-input');
const filePreviewContainer = document.getElementById('file-preview-container');
const fileNameSpan = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const openScannerBtn = document.getElementById('open-scanner-btn');
const scannerModal = document.getElementById('scanner-modal');
const scannerVideo = document.getElementById('scanner-video');
const scannerCanvas = document.getElementById('scanner-canvas');
const scannerPromptInput = document.getElementById('scanner-prompt');
const captureBtn = document.getElementById('capture-btn');
const cancelScanBtn = document.getElementById('cancel-scan-btn');
let stream = null;
let attachedFile = null;

// ** API Key ของคุณที่นี่ **
const API_KEY = "AIzaSyC3CT-M4Ei9xt8V2cZqo9OYg8OL9ejXGBA";

// --- Chat Window Visibility ---
geminiFab.addEventListener('click', () => {
    geminiChatWindow.classList.remove('hidden');
    setTimeout(() => {
        geminiChatWindow.classList.remove('transform', 'translate-y-4', 'opacity-0');
    }, 10);
});

closeGeminiChat.addEventListener('click', () => {
    geminiChatWindow.classList.add('transform', 'translate-y-4', 'opacity-0');
    setTimeout(() => {
        geminiChatWindow.classList.add('hidden');
    }, 300);
});


// --- File Attachment Logic ---
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        attachedFile = file;
        fileNameSpan.textContent = file.name;
        filePreviewContainer.classList.remove('hidden');
        filePreviewContainer.classList.add('flex');
    }
});

removeFileBtn.addEventListener('click', () => {
    attachedFile = null;
    fileInput.value = '';
    filePreviewContainer.classList.add('hidden');
    filePreviewContainer.classList.remove('flex');
});


// --- Chat Submission Logic ---
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (prompt === '' && !attachedFile) return;

    appendMessage('user', prompt, null);
    chatInput.value = '';
    sendBtn.disabled = true;
    typingIndicator.classList.remove('hidden');

    try {
        await processPrompt(prompt, attachedFile);
    } catch (error) {
        // This will now only catch very unexpected errors (e.g., from readFileAsBase64)
        console.error("Unhandled error in submission process:", error);
        appendMessage('ai', 'ขออภัยครับ เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
        attachedFile = null;
        fileInput.value = '';
        filePreviewContainer.classList.add('hidden');
        filePreviewContainer.classList.remove('flex');
        sendBtn.disabled = false;
        typingIndicator.classList.add('hidden');
    }
});

// --- Main Processing Function (REVISED with correct tool name) ---
async function processPrompt(prompt, file) {
    const model = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const parts = [{ text: prompt }];

    if (file) {
        // This can throw an error if file reading fails, which will be caught by the outer try/catch
        const base64Data = await readFileAsBase64(file);
        parts.push({
            inlineData: {
                mimeType: file.type,
                data: base64Data
            }
        });
    }

    const payload = {
        contents: [{ role: "user", parts: parts }],
        tools: [{ "google_search_retrieval": {} }], // <-- FIXED THIS LINE
    };

    try {
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json(); // This can throw if response is not JSON (e.g. CORS error)

        if (!response.ok || result.error) {
            console.error("Google API Error Response:", result);
            const errorMessage = result.error?.message || 'API returned an error with no message.';
            appendMessage('ai', `ขออภัยครับ เกิดข้อผิดพลาดจาก API: ${errorMessage}`);
            return;
        }

        const candidate = result.candidates?.[0];
        const aiResponseText = candidate?.content?.parts?.[0]?.text;

        if (aiResponseText) {
            appendMessage('ai', aiResponseText);
        } else {
            console.warn("No valid text response found in candidate:", candidate);
            appendMessage('ai', 'ขออภัยครับ Gemini ไม่ได้ส่งข้อความตอบกลับที่ถูกต้อง');
        }

    } catch (error) {
        // This will catch network errors or JSON parsing errors.
        console.error("Error during API call or JSON parsing:", error);
        appendMessage('ai', `ขออภัยครับ ไม่สามารถประมวลผลคำขอได้ อาจมีปัญหาเกี่ยวกับเครือข่ายหรือการตั้งค่า API Key กรุณาตรวจสอบ Console สำหรับข้อมูลเพิ่มเติม`);
    }
}


function appendMessage(sender, text, sources = null) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const messageContent = document.createElement('div');
    messageContent.className = `p-3 rounded-lg max-w-lg ${sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
    messageContent.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); // Render newlines

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'flex items-end gap-2';

    wrapperDiv.appendChild(messageContent);

    if (sender === 'ai') {
        const ttsButton = document.createElement('div');
        ttsButton.className = 'tts-button';
        ttsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#4b5563"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        ttsButton.onclick = () => playAudio(ttsButton, text);
        wrapperDiv.appendChild(ttsButton);
    }
    
    messageContainer.appendChild(wrapperDiv);

    chatHistory.appendChild(messageContainer);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) { // Rate limit
                console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
                continue;
            }
            return response; // Return response even if not ok, to be handled by the caller
        } catch (error) {
            if (i === retries - 1) throw error;
            console.error(`Fetch failed on attempt ${i + 1}/${retries}. Retrying...`, error);
            await new Promise(res => setTimeout(res, delay * 2));
        }
    }
}


// --- Audio Helper Functions ---
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToWav(pcmData, numChannels, sampleRate) {
    const blockAlign = numChannels * 2;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const pcm16 = new Int16Array(buffer, 44);
    pcm16.set(pcmData);

    return new Blob([view], { type: 'audio/wav' });
}


async function playAudio(button, text) {
    button.classList.add('loading');
    button.disabled = true;

    try {
        const payload = {
            contents: [{
                parts: [{ text: text }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
        
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType;

        if (audioData && mimeType && mimeType.startsWith("audio/")) {
            const sampleRateMatch = mimeType.match(/rate=(\d+)/);
            if (sampleRateMatch) {
                const sampleRate = parseInt(sampleRateMatch[1], 10);
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                const wavBlob = pcmToWav(pcm16, 1, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    button.classList.remove('loading');
                    button.disabled = false;
                };
            }
        }
    } catch (error) {
        console.error("Error playing audio:", error);
        button.classList.remove('loading');
        button.disabled = false;
    }
}


// --- Document Scanner Logic ---
openScannerBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        scannerVideo.srcObject = stream;
        scannerVideo.play();
        scannerVideo.classList.remove('hidden');
        scannerModal.classList.remove('hidden');
    } catch (err) {
        console.error("Error accessing camera: ", err);
        // Fallback to file input if camera access fails
        fileInput.click();
    }
});

cancelScanBtn.addEventListener('click', () => {
    stopCamera();
    scannerModal.classList.add('hidden');
});

captureBtn.addEventListener('click', () => {
    scannerCanvas.width = scannerVideo.videoWidth;
    scannerCanvas.height = scannerVideo.videoHeight;
    const context = scannerCanvas.getContext('2d');
    context.drawImage(scannerVideo, 0, 0, scannerCanvas.width, scannerCanvas.height);
    
    scannerCanvas.toBlob(async (blob) => {
        const file = new File([blob], "scanned_document.png", { type: "image/png" });
        
        const prompt = scannerPromptInput.value.trim();
        
        appendMessage('user', `(เอกสารที่สแกน) ${prompt}`);
        chatInput.value = '';
        sendBtn.disabled = true;
        typingIndicator.classList.remove('hidden');

        stopCamera();
        scannerModal.classList.add('hidden');

        try {
            await processPrompt(prompt, file);
        } catch (error) {
            console.error("Error processing scanned image:", error);
            appendMessage('ai', 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลคำขอของคุณ');
        } finally {
            sendBtn.disabled = false;
            typingIndicator.classList.add('hidden');
            scannerPromptInput.value = '';
        }
    }, 'image/png');
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

