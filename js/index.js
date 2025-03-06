const screens = {
    initial: document.getElementById('initial-screen'),
    connecting: document.getElementById('connecting-screen'),
    connected: document.getElementById('connected-screen')
};

const deviceName = document.getElementById('device-name');
const deviceNameInput = document.getElementById('device-name-input');
const connectButton = document.getElementById('button-connect');
const echoButton = document.getElementById('button-echo');

// 修改test button
const ledButton = document.getElementById('button-led');
const ledOffButton = document.getElementById('button-led-off');

const compassButton = document.getElementById('button-compass');
const speakerButton = document.getElementById('button-speaker');
const batteryButton = document.getElementById('button-battery');
const brightnessButtonUp = document.getElementById('button-brightness-up');
const brightnessButtonuDown = document.getElementById('button-brightness-down');

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
    document.getElementById("bluetooth-is-available-message").innerText = "Connect Success";
    screens.connecting.style.display = 'none';
    screens.initial.style.display = 'none';
    screens.connected.style.display = 'block';
    imageList.innerHTML = '';
    // device id
    localStorage.setItem("deviceId", mcumgr._device.id);
    // 轉跳到 test.html 頁面
    // window.location.href = "test.html";

    // 重置 LED 按鈕：移除 disabled 屬性和 class
    ledButton.disabled = false;
    ledButton.classList.remove('disabled');
    ledOffButton.disabled = false;
    ledOffButton.classList.remove('disabled');
    // 在 onConnect 回呼中重置 LED 狀態
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerText = "N/A";
    document.getElementById('speaker-status').innerText = "N/A";
    document.getElementById('brightness-up-status').innerText = "N/A";
    document.getElementById('brightness-down-status').innerText = "N/A";
    document.getElementById('battery-status').innerText = "N/A";


    // 重新初始化 log 陣列，並記錄 device name 與 S/N
    logEntries = [];
    addLogEntry("Device", `Connected: ${mcumgr.name}`);
    // 查詢影像狀態等
    mcumgr.cmdImageState();
});
mcumgr.onDisconnect(() => {
    deviceName.innerText = 'Connect your device';
    screens.connecting.style.display = 'none';
    screens.connected.style.display = 'none';
    screens.initial.style.display = 'block';

    // 清空 LED 狀態與 log
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    logEntries = [];

    // Clear BT mac input
    document.getElementById("mac-input").value = "";
    document.getElementById("device-name-input").value = "";
    document.getElementById("sn-input").value = "";

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
            // LED ON 回應處理
            if (output === "LED turned on") {
                const ledOnStatusElem = document.getElementById('led-on-status');
                ledOnStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                addLogEntry("LEDON", "PASS");
                pendingLEDON = false;
            }
            // LED OFF 回應處理
            else if (output === "LED turned off") {
                const ledOffStatusElem = document.getElementById('led-off-status');
                ledOffStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                addLogEntry("LEDOFF", "PASS");
                pendingLEDOFF = false;
            }
            // 若回傳內容不符合預期，依 pending 狀態分別更新
            else {
                if (pendingLEDON) {
                    const ledOnStatusElem = document.getElementById('led-on-status');
                    ledOnStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
                    addLogEntry("LEDON", "FAIL");
                    pendingLEDON = false;
                }
                if (pendingLEDOFF) {
                    const ledOffStatusElem = document.getElementById('led-off-status');
                    ledOffStatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
                    addLogEntry("LEDOFF", "FAIL");
                    pendingLEDOFF = false;
                }
            }
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

// 新增全域變數，記錄 LED 按鈕是否等待回應
let pendingLEDON = false;
let pendingLEDOFF = false;

// 全域用來儲存 log 記錄的陣列
let logEntries = [];

// 工具函式：加入一筆 log 記錄（包含時間戳、device name 與 S/N）
function addLogEntry(testName, status) {
    const timestamp = new Date().toLocaleString();
    const currentDeviceName = deviceName.innerText || "Unknown Device";
    const snValue = document.getElementById("sn-input").value || "No S/N";
    // testName 使用大寫關鍵字，例如 "LEDON" 或 "LEDOFF"
    logEntries.push(`[${timestamp}] ${currentDeviceName} - S/N: ${snValue} - ${testName}: ${status}`);
}


// LED ON / LED OFF 的按鈕事件處理
ledButton.addEventListener('click', async () => {
    // 禁用按鈕，並加入 disabled 樣式（AdminLTE3/Bootstrap 會自動處理灰色顯示）
    pendingLEDON = true;
    ledButton.disabled = true;
    ledButton.classList.add('disabled');
    await mcumgr.smpLed();
    // 可選擇在發送命令時先加入記錄，例如暫時標記為等待回應
    addLogEntry("LED ON", "");
});

ledOffButton.addEventListener('click', async () => {
    pendingLEDOFF = true;
    ledOffButton.disabled = true;
    ledOffButton.classList.add('disabled');
    await mcumgr.smpLedoff();
    addLogEntry("LED OFF", "");
});


compassButton.addEventListener('click', async () => {
    const message = prompt('LED off', 'LED off!');
    await mcumgr.smpCompass(message);
});
speakerButton.addEventListener('click', async () => {
    const message = prompt('LED off', 'LED off!');
    await mcumgr.smpSpeaker(message);
});
batteryButton.addEventListener('click', async () => {
    const message = prompt('LED off', 'LED off!');
    await mcumgr.smpBattery(message);
});
brightnessButtonUp.addEventListener('click', async () => {
    const message = prompt('LED off', 'LED off!');
    await mcumgr.smpBrightnessUp(message);
});
brightnessButtonuDown.addEventListener('click', async () => {
    const message = prompt('LED off', 'LED off!');
    await mcumgr.smpBrightnessDown(message);
});

// 輸出 log 按鈕的事件處理
const exportLogButton = document.getElementById("export-log");
// 輸出 XML Log 按鈕事件處理
exportLogButton.addEventListener("click", function () {
    // 取得 LED ON 與 LED OFF 的狀態文字
    const ledOnStatus = document.getElementById("led-on-status").textContent.trim();
    const ledOffStatus = document.getElementById("led-off-status").textContent.trim();
    // 判斷整體測試結果：若兩項皆 PASS 則整體 PASS，否則 FAIL
    let overall = "PASS";
    if (ledOnStatus.toUpperCase() !== "PASS" || ledOffStatus.toUpperCase() !== "PASS") {
        overall = "FAIL";
    }
    // 取得 S/N 與 BT MAC 輸入欄的值
    const snValue = document.getElementById("sn-input").value.trim();
    const btMacValue = document.getElementById("mac-input").value.trim();

    // 組成檔案名稱，例如 "ms5564P_123456789.xml" 或 "ms5564F_123456789.xml"
    const fileName = `ms5564${overall === "PASS" ? "P" : "F"}_${snValue}.xml`;

    // 產生 XML 格式內容，順序依序為 SN、LEDON、LEDOFF 與 BT_MAC
    const xmlContent = `<TestInfo>
    <TestItem Key="SN">${snValue}</TestItem><TestItem Key="BT_MAC">${btMacValue}</TestItem><TestItem Key="LEDON">${ledOnStatus.toUpperCase()}</TestItem><TestItem Key="LEDOFF">${ledOffStatus.toUpperCase()}</TestItem></TestInfo>`;

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
    const deviceIdDisplay = document.getElementById("device-id-display");
    // 如果連線中，更新顯示連線設備的 id；否則顯示 "未連線"
    if (typeof mcumgr !== "undefined" && mcumgr._device) {
        deviceIdDisplay.innerText = mcumgr._device.id;
        // 也可以存入 localStorage 以供後續頁面使用
        localStorage.setItem("deviceId", mcumgr._device.id);
    } else {
        const storedId = localStorage.getItem("deviceId");
        deviceIdDisplay.innerText = storedId ? storedId : "未連線";
    }
});

// 過濾Bt mac字串
document.getElementById("mac-input").addEventListener("input", function () {
    var mac = this.value.trim();
    var parts = mac.split(":");
    if (parts.length >= 2) {
        // 取最後兩組，例如 ["E1", "91"] → "E191"
        var filtered = parts.slice(-2).join("");
        // 自動填入 Device name (optional) 輸入框中
        document.getElementById("device-name-input").value = filtered;
    }
});
