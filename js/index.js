// --------------------------------------------------------------------------------------------------
// 儲存回應結果 ("Pass" 或 "Fail")
let ledOnResult = null;
let ledOffResult = null;
let compassResult = null;
let speakerResult = null;
let brightnessUpResult = null;
let brightnessDownResult = null;
let batteryResult = null;

// 新增全域變數，記錄按鈕是否等待回應
let pendingLEDON = false;
let pendingLEDOFF = false;
let pendingCOMPASS = false;
let pendingSPEAKER = false;
let pendingBRIGHTNESSUP = false;
let pendingBRIGHTNESSDOWN = false;
let pendingBATTERY = false;

// 全域用來儲存 log 記錄的陣列
let logEntries = [];

const screens = {
    initial: document.getElementById('initial-screen'),
    connecting: document.getElementById('connecting-screen'),
    connected: document.getElementById('connected-screen')
};
// --------------------------------------------------------------------------------------------------

const deviceName = document.getElementById('device-name');
const deviceNameInput = document.getElementById('device-name-input');
const connectButton = document.getElementById('button-connect');
const echoButton = document.getElementById('button-echo');

// 修改test button
const ledButton = document.getElementById('button-led');
const ledOffButton = document.getElementById('button-led-off');
const compassButton = document.getElementById('button-compass');
const speakerButton = document.getElementById('button-speaker');
const brightnessButtonUp = document.getElementById('button-brightness-up');
const brightnessButtonDown = document.getElementById('button-brightness-down');
const batteryButton = document.getElementById('button-battery');

// 修改test button

const disconnectButton = document.getElementById('button-disconnect');
const resetButton = document.getElementById('button-reset');
const imageStateButton = document.getElementById('button-image-state');
const eraseButton = document.getElementById('button-erase');
const testButton = document.getElementById('button-test');
const confirmButton = document.getElementById('button-confirm');
const imageList = document.getElementById('image-list');
const fileInfo = document.getElementById('file-info');
const fileStatus = document.getElementById('file-status');
const fileImage = document.getElementById('file-image');
const fileUpload = document.getElementById('file-upload');
const bluetoothIsAvailable = document.getElementById('bluetooth-is-available');
const bluetoothIsAvailableMessage = document.getElementById('bluetooth-is-available-message');
const connectBlock = document.getElementById('connect-block');

if (navigator && navigator.bluetooth && navigator.bluetooth.getAvailability()) {
    bluetoothIsAvailableMessage.innerText = 'Bluetooth is available in your browser.';
    bluetoothIsAvailable.className = 'alert alert-success';
    connectBlock.style.display = 'block';
} else {
    bluetoothIsAvailable.className = 'alert alert-danger';
    bluetoothIsAvailableMessage.innerText = 'Bluetooth is not available in your browser.';
}

let file = null;
let fileData = null;
let images = [];

deviceNameInput.value = localStorage.getItem('deviceName');
deviceNameInput.addEventListener('change', () => {
    localStorage.setItem('deviceName', deviceNameInput.value);
});

const mcumgr = new MCUManager();
mcumgr.onConnecting(() => {
    console.log('BT Connecting...');
    screens.initial.style.display = 'none';
    screens.connected.style.display = 'none';
    screens.connecting.style.display = 'block';
});
mcumgr.onConnect(() => {
    // 更新畫面上顯示的裝置名稱
    deviceName.innerText = mcumgr.name;
    // document.getElementById("bluetooth-is-available-message").innerText = "Connect Success";
    screens.connecting.style.display = 'none';
    screens.initial.style.display = 'none';
    screens.connected.style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('function-test-section').style.display = 'none';
    document.querySelector('.content-header h1').innerText = "Dashboard";

    imageList.innerHTML = '';
    // device id
    // localStorage.setItem("deviceId", mKCcumgr._device.id);
    // 轉跳到 test.html 頁面
    // window.location.href = "test.html";

    // 重置 LED 按鈕：移除 disabled 屬性和 class
    ledButton.disabled = false;
    ledButton.classList.remove('disabled');

    ledOffButton.disabled = false;
    ledOffButton.classList.remove('disabled');

    compassButton.disabled = false;
    compassButton.classList.remove('disabled');

    speakerButton.disabled = false;
    speakerButton.classList.remove('disabled');

    brightnessButtonUp.disabled = false;
    brightnessButtonUp.classList.remove('disabled');;

    brightnessButtonDown.disabled = false;
    brightnessButtonDown.classList.remove('disabled');

    batteryButton.disabled = false;
    batteryButton.classList.remove('disabled');

    // 在 onConnect 回呼中重置 LED 狀態
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';;
    document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';


    // 重新初始化 log 陣列，並記錄 device name 與 S/N
    logEntries = [];
    addLogEntry("Device", `Connected: ${mcumgr.name}`);
    // 查詢影像狀態等
    mcumgr.cmdImageState();
});
mcumgr.onDisconnect(() => {
    deviceName.innerText = 'UnConnect';
    screens.connecting.style.display = 'none';
    screens.connected.style.display = 'none';
    screens.initial.style.display = 'block';
    
    
    // 清空 test item 狀態與 log
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    logEntries = [];
    
    // Clear BT mac input
    document.getElementById("mac-input").value = "";
    document.getElementById("device-name-input").value = "";
    document.getElementById("sn-input").value = "";
    document.querySelector('.content-header h1').innerText = "";
    
});

mcumgr.onMessage(({ op, group, id, data, length }) => {
    switch (group) {
        case MGMT_GROUP_ID_OS:
            switch (id) {
                case OS_MGMT_ID_ECHO:
                    alert(data.r);
                    break;
                case OS_MGMT_ID_TASKSTAT:
                    console.table(data.tasks);
                    break;
                case OS_MGMT_ID_MPSTAT:
                    console.log(data);
                    break;
            }
            break;
        case MGMT_GROUP_ID_SHELL:
            // alert(data.o);
            const output = data.o.trim();
            console.log("Received response:", data.o);
            // LED ON 回應處理
            if (output === "LED turned on") {
                // const ledOnStatusElem = document.getElementById('led-on-status');
                // ledOnStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("LEDON", "PASS");
                ledOnResult = "Pass";
                pendingLEDON = false;
            }
            // LED OFF 回應處理
            else if (output === "LED turned off") {
                // const ledOffStatusElem = document.getElementById('led-off-status');
                // ledOffStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("LEDOFF", "PASS");
                ledOffResult = "Pass";
                pendingLEDOFF = false;
            }
            // Compass 回應處理
            else if (output === "get compass values") {
                // const compassStatusElem = document.getElementById('compass-status');
                // compassStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("COMPASS", "PASS");
                compassResult = "Pass";
                pendingCOMPASS = false;
            }
            // Speaker 回應處理
            else if (output === "Control speaker") {
                // const speakerStatusElem = document.getElementById('speaker-status');
                // speakerStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("SPEAKER", "PASS");
                speakerResult = "Pass";
                pendingSPEAKER = false;
            }
            // Brightness Up 回應處理
            else if (output === "Control brightness up") {
                // const brightnessUpStatusElem = document.getElementById('brightness-up-status');
                // brightnessUpStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("BRIGHTNESSUP", "PASS");
                brightnessUpResult = "Pass";
                pendingBRIGHTNESSUP = false;
            }
            // Brightness Down 回應處理
            else if (output === "Control brightness down") {
                // const brightnessDownStatusElem = document.getElementById('brightness-down-status');
                // brightnessDownStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("BRIGHTNESSDOWN", "PASS");
                brightnessDownResult = "Pass";
                pendingBRIGHTNESSDOWN = false;
            }
            // Battery 回應處理
            else if (output === "get battery voltage") {
                // const batteryStatusElem = document.getElementById('battery-status');
                // batteryStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("BATTERY", "PASS");
                batteryResult = "Pass";
                pendingBATTERY = false;
            }
            // 不做 catch-all，讓各自超時機制處理失敗
            break;
        case MGMT_GROUP_ID_IMAGE:
            switch (id) {
                case IMG_MGMT_ID_STATE:
                    images = data.images;
                    let imagesHTML = '';
                    images?.forEach(image => {
                        imagesHTML += `<div class="image ${image.active ? 'active' : 'standby'}">`;
                        imagesHTML += `<h2>Slot #${image.slot} ${image.active ? 'active' : 'standby'}</h2>`;
                        imagesHTML += '<table>';
                        const hashStr = Array.from(image.hash).map(byte => byte.toString(16).padStart(2, '0')).join('');
                        imagesHTML += `<tr><th>Version</th><td>v${image.version}</td></tr>`;
                        imagesHTML += `<tr><th>Bootable</th><td>${image.bootable}</td></tr>`;
                        imagesHTML += `<tr><th>Confirmed</th><td>${image.confirmed}</td></tr>`;
                        imagesHTML += `<tr><th>Pending</th><td>${image.pending}</td></tr>`;
                        imagesHTML += `<tr><th>Hash</th><td>${hashStr}</td></tr>`;
                        imagesHTML += '</table>';
                        imagesHTML += '</div>';
                    });
                    imageList.innerHTML = imagesHTML;

                    testButton.disabled = !(data.images.length > 1 && data.images[1].pending === false);
                    confirmButton.disabled = !(data.images.length > 0 && data.images[0].confirmed === false);
                    break;
            }
            break;
        default:
            console.log('Unknown group');
            break;
    }
});

mcumgr.onImageUploadProgress(({ percentage }) => {
    fileStatus.innerText = `Uploading... ${percentage}%`;
});

mcumgr.onImageUploadFinished(() => {
    fileStatus.innerText = 'Upload complete';
    fileInfo.innerHTML = '';
    fileImage.value = '';
    mcumgr.cmdImageState();
});

fileImage.addEventListener('change', () => {
    file = fileImage.files[0];
    fileData = null;
    const reader = new FileReader();
    reader.onload = async () => {
        fileData = reader.result;
        try {
            const info = await mcumgr.imageInfo(fileData);
            let table = `<table>`
            table += `<tr><th>Version</th><td>v${info.version}</td></tr>`;
            table += `<tr><th>Hash</th><td>${info.hash}</td></tr>`;
            table += `<tr><th>File Size</th><td>${fileData.byteLength} bytes</td></tr>`;
            table += `<tr><th>Size</th><td>${info.imageSize} bytes</td></tr>`;
            table += `</table>`;

            fileStatus.innerText = 'Ready to upload';
            fileInfo.innerHTML = table;
            fileUpload.disabled = false;
        } catch (e) {
            fileInfo.innerHTML = `ERROR: ${e.message}`;
        }
    };
    reader.readAsArrayBuffer(file);
});
fileUpload.addEventListener('click', event => {
    fileUpload.disabled = true;
    event.stopPropagation();
    if (file && fileData) {
        mcumgr.cmdUpload(fileData);
    }
});

connectButton.addEventListener('click', async () => {
    let filters = null;
    if (deviceNameInput.value) {
        filters = [{ namePrefix: deviceNameInput.value }];
    };
    await mcumgr.connect(filters);
});

disconnectButton.addEventListener('click', async () => {
    mcumgr.disconnect();
});

echoButton.addEventListener('click', async () => {
    const message = prompt('Enter a text message to send', 'Hello World!');
    await mcumgr.smpEcho(message);
});

// 修改test button

// 工具函式：加入一筆 log 記錄（包含時間戳、device name 與 S/N）
function addLogEntry(testName, status) {
    const timestamp = new Date().toLocaleString();
    const currentDeviceName = deviceName.innerText || "Unknown Device";
    const snValue = document.getElementById("sn-input").value || "No S/N";
    // testName 使用大寫關鍵字，例如 "LEDON" 或 "LEDOFF"
    logEntries.push(`[${timestamp}] ${currentDeviceName} - S/N: ${snValue} - ${testName}: ${status}`);
}

// 按鈕事件處理
ledButton.addEventListener('click', async () => {
    // 禁用按鈕，並加入 disabled 樣式（AdminLTE3/Bootstrap 會自動處理灰色顯示）
    pendingLEDON = true;
    ledOnResult = null;  //add result
    ledButton.disabled = true;
    ledButton.classList.add('disabled');

    // 取得 LED ON 狀態區域（原本顯示 "N/A"）
    const ledOnStatusElem = document.getElementById('led-on-status');
    // 清空原有內容
    ledOnStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    ledOnStatusElem.appendChild(spinner);

    // // 建立進度條容器 (使用 Bootstrap/ AdminLTE 樣式)
    // const progressBarContainer = document.createElement('div');
    // progressBarContainer.className = 'progress mt-2';
    // progressBarContainer.style.height = '20px';

    // // 建立進度條
    // const progressBar = document.createElement('div');
    // progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    // progressBar.role = 'progressbar';
    // progressBar.style.width = '0%';
    // progressBar.setAttribute('aria-valuenow', '0');
    // progressBar.setAttribute('aria-valuemin', '0');
    // progressBar.setAttribute('aria-valuemax', '100');
    // progressBarContainer.appendChild(progressBar);

    // // 插入進度條到 LED ON 狀態區域
    // ledOnStatusElem.appendChild(progressBarContainer);

    // 動畫設定：3000 毫秒內從 0% 到 100%
    const duration = 1000;  // 毫秒
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);

    await mcumgr.smpLed();
    // 可選擇在發送命令時先加入記錄，例如暫時標記為等待回應
    addLogEntry("LED ON", "");
    // 等待進度條結束後再更新狀態 (3000ms 後)
    setTimeout(() => {
        // 移除 spinner
        ledOnStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (ledOnResult === "Pass") {
            ledOnStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            ledOnStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
    // Timout for progessbar function

    // setTimeout(() => {
    //     // 如果尚未收到回應，預設記為 Fail
    //     if (pendingLEDON && !ledOnResult) {
    //         ledOnResult = "Fail";
    //         addLogEntry("LEDON", "FAIL");
    //         pendingLEDON = false;
    //     }
    //     console.log("LED ON button click: ", ledOnResult)
    //     console.log("LED on: ", mcumgr.smpLed)
    //     // 更新 LED ON 狀態顯示，移除進度條並顯示結果
    //     if (ledOnResult === "Pass") {
    //         ledOnStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
    //     } else {
    //         ledOnStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
    //     }
    // }, duration);

});

ledOffButton.addEventListener('click', async () => {
    pendingLEDOFF = true;
    ledOffResult = null;  //add result
    ledOffButton.disabled = true;
    ledOffButton.classList.add('disabled');

    // 取得 LED OFF 狀態區，清空原內容（原先可能顯示 "N/A"）
    const ledOffStatusElem = document.getElementById('led-off-status');
    ledOffStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED Off 狀態區域
    ledOffStatusElem.appendChild(spinner);

    // 設定進度條動畫，duration 為 3000 毫秒
    const duration = 1000;
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);

    await mcumgr.smpLedoff();
    
    addLogEntry("LED OFF", "");
    // 若 3 秒內仍未收到回應，則自動更新為 FAIL
    // 等待 duration 毫秒後再更新 UI
    setTimeout(() => {
        // 移除 spinner
        ledOffStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (ledOffResult === "Pass") {
            ledOffStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            ledOffStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});

compassButton.addEventListener('click', async () => {
    pendingCOMPASS = true;
    compassResult = null;  //add result
    compassButton.disabled = true;
    compassButton.classList.add('disabled');

    // 取得 Compass 狀態區域（原本顯示 "N/A"）
    const compassStatusElem = document.getElementById('compass-status');
    // 清空原有內容
    compassStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    compassStatusElem.appendChild(spinner);

    // 動畫設定：3000 毫秒內從 0% 到 100%
    const duration = 1000;  // 毫秒
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);
    await mcumgr.smpCompass();
    addLogEntry("Compass", "");

    // 等待進度條結束後再更新狀態 (3000ms 後)
    setTimeout(() => {
        // 移除 spinner
        compassStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (compassResult === "Pass") {
            compassStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            compassStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});
speakerButton.addEventListener('click', async () => {
    pendingSPEAKER = true;
    speakerResult = null;
    speakerButton.disabled = true;
    speakerButton.classList.add('disabled');

    // 取得 speaker 狀態區，清空原內容（原先可能顯示 "N/A"）
    const speakerStatusElem = document.getElementById('speaker-status');
    speakerStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    speakerStatusElem.appendChild(spinner);

    // 設定進度條動畫，duration 為 3000 毫秒
    const duration = 1000;
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);
    await mcumgr.smpSpeaker();
    addLogEntry("Speaker", "");
    // 等待 duration 毫秒後再更新 UI
    setTimeout(() => {
        // 移除 spinner
        speakerStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (speakerResult === "Pass") {
            speakerStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            speakerStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});
brightnessButtonUp.addEventListener('click', async () => {
    pendingBRIGHTNESSUP = true;
    brightnessUpResult = null;
    brightnessButtonUp.disabled = true;
    brightnessButtonUp.classList.add('disabled');

    // 取得 brightness up 狀態區，清空原內容（原先可能顯示 "N/A"）
    const brightnessUpStatusElem = document.getElementById('brightness-up-status');
    brightnessUpStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    brightnessUpStatusElem.appendChild(spinner);

    // 設定進度條動畫，duration 為 3000 毫秒
    const duration = 1000;
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);
    await mcumgr.smpBrightnessUp();
    addLogEntry("BrightnessUp", "");
    // 等待 duration 毫秒後再更新 UI
    setTimeout(() => {
        // 移除 spinner
        brightnessUpStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (brightnessUpResult === "Pass") {
            brightnessUpStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            brightnessUpStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});
brightnessButtonDown.addEventListener('click', async () => {
    pendingBRIGHTNESSDOWN = true;
    brightnessDownResult = null;
    brightnessButtonDown.disabled = true;
    brightnessButtonDown.classList.add('disabled');

    // 取得 brightness down 狀態區，清空原內容（原先可能顯示 "N/A"）
    const brightnessDownStatusElem = document.getElementById('brightness-down-status');
    brightnessDownStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    brightnessDownStatusElem.appendChild(spinner);

    // 設定進度條動畫，duration 為 3000 毫秒
    const duration = 1000;
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);
    await mcumgr.smpBrightnessDown();
    addLogEntry("BrightnessDown", "");
    // 等待 duration 毫秒後再更新 UI
    setTimeout(() => {
        // 移除 spinner
        brightnessDownStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (brightnessDownResult === "Pass") {
            brightnessDownStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            brightnessDownStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});
batteryButton.addEventListener('click', async () => {
    pendingBATTERY = true;
    batteryResult = null;
    batteryButton.disabled = true;
    batteryButton.classList.add('disabled');

    // 取得 battery 狀態區，清空原內容（原先可能顯示 "N/A"）
    const batteryStatusElem = document.getElementById('battery-status');
    batteryStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';  // 使用 AdminLTE/Bootstrap spinner 樣式
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';

    // 插入 spinner 到 LED ON 狀態區域
    batteryStatusElem.appendChild(spinner);

    // 設定進度條動畫，duration 為 3000 毫秒
    const duration = 1000;
    const intervalTime = 100;
    let elapsed = 0;
    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
        if (elapsed >= duration) {
            clearInterval(progressInterval);
        }
    }, intervalTime);
    await mcumgr.smpBattery();
    addLogEntry("Battery", "");
    // 等待 duration 毫秒後再更新 UI
    setTimeout(() => {
        // 移除 spinner
        batteryStatusElem.removeChild(spinner);
        // 根據結果顯示狀態標籤
        if (batteryResult === "Pass") {
            batteryStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
        } else {
            batteryStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
        }
    }, duration);
});

// 輸出 log 按鈕的事件處理
const exportLogButton = document.getElementById("export-log");
// 輸出 XML Log 按鈕事件處理
exportLogButton.addEventListener("click", function () {
    // 取得 LED ON 與 LED OFF 的狀態文字
    const ledOnStatus = document.getElementById("led-on-status").textContent.trim();
    const ledOffStatus = document.getElementById("led-off-status").textContent.trim();
    const compassStatus = document.getElementById("compass-status").textContent.trim();
    const speakerStatus = document.getElementById("speaker-status").textContent.trim();
    const brightnessUpStatus = document.getElementById("brightness-up-status").textContent.trim();
    const brightnessDownStatus = document.getElementById("brightness-down-status").textContent.trim();
    const batteryStatus = document.getElementById("battery-status").textContent.trim();

    // 判斷整體測試結果：若兩項皆 PASS 則整體 PASS，否則 FAIL
    let overall = "PASS";
    if (ledOnStatus.toUpperCase() !== "PASS" || ledOffStatus.toUpperCase() !== "PASS" || compassStatus.toUpperCase() !== "PASS" || speakerStatus.toUpperCase() !== "PASS" || brightnessUpStatus.toUpperCase() !== "PASS" || brightnessDownStatus.toUpperCase() !== "PASS" || batteryStatus.toUpperCase() !== "PASS") {
        overall = "FAIL";
    }
    // 取得 S/N 與 BT MAC 輸入欄的值
    const snValue = document.getElementById("sn-input").value.trim();
    const btMacValue = document.getElementById("mac-input").value.trim();

    // 組成檔案名稱，例如 "ms5564P_123456789.xml" 或 "ms5564F_123456789.xml"
    const fileName = `ms5564${overall === "PASS" ? "P" : "F"}_${snValue}.xml`;

    // 產生 XML 格式內容，順序依序為 SN、LEDON、LEDOFF 與 BT_MAC
    const xmlContent = `<TestInfo><TestItem Key="SN">ms${snValue}</TestItem><TestItem Key="BT_MAC">${btMacValue}</TestItem><TestItem Key="LEDON">${ledOnStatus.toUpperCase()}</TestItem><TestItem Key="LEDOFF">${ledOffStatus.toUpperCase()}</TestItem><TestItem Key="COMPASS">${compassStatus.toUpperCase()}</TestItem><TestItem Key="SPEAKER">${speakerStatus.toUpperCase()}</TestItem><TestItem Key="BRIGHTNESSUP">${brightnessUpStatus.toUpperCase()}</TestItem><TestItem Key="BRIGHTNESSDOWN">${brightnessDownStatus.toUpperCase()}</TestItem><TestItem Key="BATTERY">${batteryStatus.toUpperCase()}</TestItem></TestInfo>`;

    // 使用 Blob 產生 XML 檔案並觸發下載
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});

// 修改test button


resetButton.addEventListener('click', async () => {
    await mcumgr.cmdReset();
});

imageStateButton.addEventListener('click', async () => {
    await mcumgr.cmdImageState();
});

eraseButton.addEventListener('click', async () => {
    await mcumgr.cmdImageErase();
});

testButton.addEventListener('click', async () => {
    if (images.length > 1 && images[1].pending === false) {
        await mcumgr.cmdImageTest(images[1].hash);
    }
});

confirmButton.addEventListener('click', async () => {
    if (images.length > 0 && images[0].confirmed === false) {
        await mcumgr.cmdImageConfirm(images[0].hash);
    }
});

// 在此加入 Device ID 顯示更新邏輯
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.content-header h1').innerText = 'BT Connect';

    // Device ID
    // const deviceIdDisplay = document.getElementById("device-id-display");
    // // 如果連線中，更新顯示連線設備的 id；否則顯示 "未連線"
    // if (typeof mcumgr !== "undefined" && mcumgr._device) {
    //     deviceIdDisplay.innerText = mcumgr._device.id;
    //     // 也可以存入 localStorage 以供後續頁面使用
    //     localStorage.setItem("deviceId", mcumgr._device.id);
    // } else {
    //     const storedId = localStorage.getItem("deviceId");
    //     deviceIdDisplay.innerText = storedId ? storedId : "未連線";
    // }
});

// 過濾Bt mac字串
document.getElementById("mac-input").addEventListener("input", function () {
    var mac = this.value.trim();
    // 更新mac adress 顯示欄
    document.getElementById("mac-display").value = mac;
    var parts = mac.split(":");
    if (parts.length >= 2) {
        // 取最後兩組，例如 ["E1", "91"] → "E191"
        var filtered = parts.slice(-2).join("");
        // 自動填入 Device name (optional) 輸入框中
        document.getElementById("device-name-input").value = filtered;
        // document.getElementById("device-name-input").value = 'M' + filtered;
    }
});

document.getElementById('nav-function-test').addEventListener('click', function (e) {
    e.preventDefault();
    // 切換頁面：隱藏 Dashboard 頁面，顯示功能測試頁面
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('function-test-section').style.display = 'block';
    // 同時更新內容標頭文字
    document.querySelector('.content-header h1').innerText = 'Function Test';
});

document.getElementById('nav-dashboard').addEventListener('click', function (e) {
    e.preventDefault();
    // 切換頁面：隱藏 Function Test 頁面，顯示 Dashboard 頁面
    document.getElementById('function-test-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    // 同時更新內容標頭文字
    document.querySelector('.content-header h1').innerText = 'Dashboard';
});

// document.getElementById('btn-back-dashboard').addEventListener('click', function () {
//     // 返回 Dashboard 頁面
//     document.getElementById('function-test-section').style.display = 'none';
//     document.getElementById('dashboard-section').style.display = 'block';
//     // 更新標頭文字回 Dashboard
//     document.querySelector('.content-header h1').innerText = 'Dashboard';
// });

// document.getElementById('btn-back-dashboard').addEventListener('click', function () {
//     document.getElementById('function-test-section').style.display = 'none';
//     const dashboardSection = document.getElementById('dashboard-section');
//     if (dashboardSection) {
//         dashboardSection.style.display = 'block';
//     }
// });


document.getElementById('nav-disconnect').addEventListener('click', function (e) {
    e.preventDefault();
    mcumgr.disconnect();
    // 同時更新內容標頭文字
    document.querySelector('.content-header h1').innerText = 'BT connect';
});

