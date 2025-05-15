// --------------------------------------------------------------------------------------------------
// 儲存回應結果 ("Pass" 或 "Fail")
let ledOnResult = null;
let ledOffResult = null;
let compassResult = null;
let speakerResult = null;
let brightnessUpResult = null;
let brightnessDownResult = null;
let batteryResult = null;
let versionResult = null;
let swButtonResult = null;
let lcdButtonResult = null;


// 從 localStorage 讀取 desiredVersion，若沒有則預設為 "3.7.90"
let desiredVersion = localStorage.getItem("desiredVersion") || "3.7.90";
let batteryMax = localStorage.getItem("batteryMax") || "3000";
let batteryMin = localStorage.getItem("batteryMin") || "2000";

// 新增全域變數，記錄按鈕是否等待回應
let pendingLEDON = false;
let pendingLEDOFF = false;
let pendingCOMPASS = false;
let pendingSPEAKER = false;
// let pendingBRIGHTNESSUP = false;
// let pendingBRIGHTNESSDOWN = false;
let pendingBATTERY = false;
let lastBatteryVoltage = null;   // 記錄最新量到的電壓
let pendingVERSION = false;
let pendingSwButton = false;
let pendingLcd = false;
let compassRaw = null;

// 全域用來儲存 log 記錄的陣列
let logEntries = [];

const screens = {
    initial: document.getElementById('initial-screen'),
    connecting: document.getElementById('connecting-screen'),
    connected: document.getElementById('connected-screen')
};

// 定義duration 
const GLOBAL_DURATION = 1000;
const All_GLOBAL_DUATION = 2000;
// --------------------------------------------------------------------------------------------------

const deviceName = document.getElementById('device-name');
const deviceNameInput = document.getElementById('device-name-input');
const connectButton = document.getElementById('button-connect');
const echoButton = document.getElementById('button-echo');


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

// 修改test button--------------------------------------------------
// const ledButton = document.getElementById('button-led');
const ledOffButton = document.getElementById('button-led-off');
const compassButton = document.getElementById('button-compass');
const speakerButton = document.getElementById('button-speaker');
// const brightnessButtonUp = document.getElementById('button-brightness-up');
// const brightnessButtonDown = document.getElementById('button-brightness-down');
const batteryButton = document.getElementById('button-battery');
const versionButton = document.getElementById('button-version');
const runAllButton = document.getElementById('button-run-all');
const allTestsStatus = document.getElementById('all-tests-status');
const swButton = document.getElementById('button-sw');
const lcdButton = document.getElementById('button-lcd');

const testButtons = [
    document.getElementById('button-version'),
    // document.getElementById('button-led'),
    // document.getElementById('button-led-off'),
    document.getElementById('button-compass'),
    // document.getElementById('button-speaker'),
    // document.getElementById('button-brightness-up'),
    // document.getElementById('button-brightness-down'),
    document.getElementById('button-battery'),
];


// 修改test button--------------------------------------------------


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
    // ledButton.disabled = false;
    // ledButton.classList.remove('disabled');

    ledOffButton.disabled = false;
    ledOffButton.classList.remove('disabled');

    compassButton.disabled = false;
    compassButton.classList.remove('disabled');

    speakerButton.disabled = false;
    speakerButton.classList.remove('disabled');

    // brightnessButtonUp.disabled = false;
    // brightnessButtonUp.classList.remove('disabled');;

    // brightnessButtonDown.disabled = false;
    // brightnessButtonDown.classList.remove('disabled');

    batteryButton.disabled = false;
    batteryButton.classList.remove('disabled');

    versionButton.disabled = false;
    versionButton.classList.remove('disabled');
    lcdButton.disabled = false;
    lcdButton.classList.remove('disabled');
    

    // 在 onConnect 回呼中重置 LED 狀態
    // resetAllSwStatus();
    document.getElementById('sw1-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    
    document.getElementById('version-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    // document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';;


    // document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('lcd-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('version-output-status').innerHTML = "";
    document.getElementById('battery-output-status').innerHTML = "";
    document.getElementById('config-message').innerHTML = "";

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
    // resetAllSwStatus();
    document.getElementById('sw1-status').innerHTML = '<span class="badge badge-warning">N/A</span>';

    document.getElementById('version-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    // document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';


    // document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('lcd-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('version-output-status').innerHTML = "";
    document.getElementById('battery-output-status').innerHTML = "";
    document.getElementById('config-message').innerHTML = "";

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
            else if (output.includes("acc:") && output.includes("gyro:") && output.includes("mag:")) {
                // 1. 解析三行
                const sensorLines = output.split("\n");          // 可能一次收到多行
                const sensorData  = { acc:{}, gyro:{}, mag:{} };
            
                sensorLines.forEach(line => {
                    const m = /(acc|gyro|mag):\s*x=(-?\d*\.?\d+),\s*y=(-?\d*\.?\d+),\s*z=(-?\d*\.?\d+)/i.exec(line.trim());
                    if (m) {
                        const [ , key, x, y, z ] = m;
                        sensorData[key] = { x: +x, y: +y, z: +z };
                    }
                });
            
                // 2. 判斷是否有 0
                const values = [
                    ...Object.values(sensorData.acc),
                    ...Object.values(sensorData.gyro),
                    ...Object.values(sensorData.mag),
                ];
                const anyZero = values.some(v => Math.abs(v) === 0);
            
                compassResult  = anyZero ? "Fail" : "Pass";
                pendingCOMPASS = false;
                document.getElementById('compass-output-status').innerText = output;
            }
                
            // Speaker 回應處理
            else if (output === "speaker turn on") {
                // const speakerStatusElem = document.getElementById('speaker-status');
                // speakerStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';


                // addLogEntry("SPEAKER", "PASS");
                speakerResult = "Pass";
                pendingSPEAKER = false;
            }
            // Brightness Up 回應處理
            else if (output === "brightness up") {
                brightnessUpResult = "Pass";
                pendingBRIGHTNESSUP = false;
            }
            // Brightness Down 回應處理
            else if (output === "brightness down") {
                brightnessDownResult = "Pass";
                pendingBRIGHTNESSDOWN = false;
            }
            // 版本回應處理：如果 output 中包含 "Zephyr version"
            else if (output.includes("Zephyr version")) {
                // 顯示完整的 output 字串在版本輸出區
                document.getElementById('version-output-status').innerText = output;
                // 依據 desiredVersion 來判斷結果，例如：
                if (output === "Zephyr version " + desiredVersion) {
                    versionResult = "Pass";
                } else {
                    versionResult = "Fail";
                }
                pendingVERSION = false;
            }
            // Battery 回應處理
            // else if (output === "get battery voltage") {
            //     // const batteryStatusElem = document.getElementById('battery-status');
            //     // batteryStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
            //     // addLogEntry("BATTERY", "PASS");
            //     batteryResult = "Pass";
            //     pendingBATTERY = false;
            // }
            else if (pendingBATTERY && !isNaN(output)) {
                // 解析
                let voltage = parseInt(output);

                lastBatteryVoltage = voltage;                 // 記錄電壓
                addLogEntry("BATTERY", `${voltage}`);

                // 將頁面上battery-status只顯示數值
                document.getElementById('battery-output-status').innerText= voltage;

                // 判斷Pass/fail
                if (voltage >= batteryMin && voltage <= batteryMax){
                    batteryResult = "Pass";
                } else{
                    batteryResult = "Fail";
                }
                pendingBATTERY = false;
            }
            // SW button 回應處理
            else if (output === "please press any button") {
                swButtonResult = "Pass";
                pendingSwButton = false;
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

// 修改test button--------------------------------------------------------------------------------------

// 工具函式：加入一筆 log 記錄（包含時間戳、device name 與 S/N）
function addLogEntry(testName, status) {
    const timestamp = new Date().toLocaleString();
    const currentDeviceName = deviceName.innerText || "Unknown Device";
    const snValue = document.getElementById("sn-input").value || "No S/N";
    // testName 使用大寫關鍵字，例如 "LEDON" 或 "LEDOFF"
    logEntries.push(`[${timestamp}] ${currentDeviceName} - S/N: ${snValue} - ${testName}: ${status}`);
}

// 封鎖所有測試按鈕
function disableAllTestButtons() {
    document.querySelectorAll('#function-test-section button').forEach(btn => {
        btn.disabled = true;
    });
}
  // 啟用所有測試按鈕
function enableAllTestButtons() {
    document.querySelectorAll('#function-test-section button').forEach(btn => {
        btn.disabled = false;
    });
}  

versionButton.addEventListener('click', async () => {
        disableAllTestButtons();
        pendingVERSION = true;
        versionResult = null;  //add result

        // 取得 Version 狀態區，清空原內容（原先可能顯示 "N/A"）
        const versionStatusElem = document.getElementById('version-status');
        versionStatusElem.innerHTML = '';

        // 建立並加入 spinner
        const spinner = createSpinner();
        versionStatusElem.appendChild(spinner);

        await mcumgr.smpVersion();
        
        // 模擬進度結束後移除 spinner 並更新狀態
        setTimeout(() => {
            versionStatusElem.removeChild(spinner);
            // 根據回應結果更新狀態顯示（這裡以 ledOnResult 為例）
            versionStatusElem.innerHTML = versionResult === "Pass"
                ? '<span class="badge badge-success">Pass</span>'
                : '<span class="badge badge-danger">Fail</span>';
        }, GLOBAL_DURATION);
        enableAllTestButtons();
    });
/************** 放到工具區（例如 addLogEntry 旁邊） **************/
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

/***************************************************************
 * 1. LED 改成開／關 3 次的自動循環 + Spinner
 **************************************************************/
ledOffButton.addEventListener('click', async () => {
    disableAllTestButtons();

    // UI：鎖按鈕、顯示 Spinner
    ledOffButton.disabled = true;
    const ledOffStatus = document.getElementById('led-off-status');
    ledOffStatus.innerHTML = '';
    const spin = createSpinner();
    ledOffStatus.appendChild(spin);

    // ---- 3 次開 / 關循環 ----
    for (let i = 0; i < 3; i++) {
        
        await mcumgr.smpLed();      // 開
        await sleep(1000);
        await mcumgr.smpLedoff();   // 關
        await sleep(1000);
    }

    // UI：恢復
    ledOffStatus.removeChild(spin);
    ledOffStatus.innerHTML = '<span class="badge badge-warning">N/A</span>';
    // ledOffButton.disabled = false;

    enableAllTestButtons();
});

compassButton.addEventListener('click', async () => {
    disableAllTestButtons();
    pendingCOMPASS = true;
    compassResult = null;  //add result
    compassRaw = ""; 
    
    // 取得 Compass 狀態區域（原本顯示 "N/A"）
    const compassStatusElem = document.getElementById('compass-status');
    // 清空原有內容
    compassStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    compassStatusElem.appendChild(spinner);

    await mcumgr.smpCompass();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        compassStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示
        compassStatusElem.innerHTML = compassResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);
    enableAllTestButtons();    
});
speakerButton.addEventListener('click', async () => {
    disableAllTestButtons();
    pendingSPEAKER = true;
    speakerResult = null;

    // 取得 speaker 狀態區，清空原內容（原先可能顯示 "N/A"）
    const speakerStatusElem = document.getElementById('speaker-status');
    speakerStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    speakerStatusElem.appendChild(spinner);

    await mcumgr.smpSpeaker();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        speakerStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示
        speakerStatusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';
        
    }, GLOBAL_DURATION);
    enableAllTestButtons();  

});

batteryButton.addEventListener('click', async () => {
    disableAllTestButtons();
    pendingBATTERY = true;
    batteryResult = null;

    // 取得 battery 狀態區，清空原內容（原先可能顯示 "N/A"）
    const batteryStatusElem = document.getElementById('battery-status');
    batteryStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    batteryStatusElem.appendChild(spinner);

    await mcumgr.smpBattery();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        batteryStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示
        batteryStatusElem.innerHTML = batteryResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
    enableAllTestButtons();
});
swButton.addEventListener('click', async () => {
    disableAllTestButtons();
    pendingSwButton = true;
    swButtonResult = null;
    // 建立 Toast DOM
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-delay', '4000');      // 4 秒自動關閉

    /* ★ 直接寫 style 就能置中，也可以改成加一個自訂 class ★ */
    toast.style.position  = 'fixed';
    toast.style.top       = '50%';
    toast.style.left      = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
    toast.style.zIndex    = 1080;                  // 蓋在 modal 之上

    toast.innerHTML = `
    <div class="toast-header bg-primary text-white">
        <strong class="mr-auto">提示</strong>
        <small>now</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
    </div>
    <div class="toast-body">
        韌體已進入 SW 按鍵測試模式，請按下 SW1 ~ SW14！
    </div>
    `;

    document.body.appendChild(toast);
    $('.toast').toast('show');


    await mcumgr.smpSwButton();
    enableAllTestButtons();

});
lcdButton.addEventListener('click', async () => {

    disableAllTestButtons();
    const lcdStatusElem = document.getElementById('lcd-status');
    lcdStatusElem.innerHTML = '';
    
    // 建立 spinner 元素
    const spinner = createSpinner();
    lcdStatusElem.appendChild(spinner);

    
    // 五個顏色要執行的函式陣列
    const steps = [
        () => mcumgr.smpLcdRed(),
        () => mcumgr.smpLcdGreen(),
        () => mcumgr.smpLcdBlue(),
        () => mcumgr.smpLcdWhite(),
        () => mcumgr.smpLcdBlack(),
        () => mcumgr.smpLcdRed()
    ];
    
    // 依序執行，每次等待 3 秒
    for (const step of steps) {
        try {
            await step();                       // 發送指令
        } catch (e) {
            console.error('LCD cmd error:', e); // 發送失敗時印出錯誤但繼續
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    lcdStatusElem.removeChild(spinner);
    lcdStatusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';
    enableAllTestButtons();
});

runAllButton.addEventListener('click', async () => {
    // 禁用所有獨立測試按鈕
    disableAllTestButtons();
    // testButtons.forEach(btn => btn.disabled = true);
    allTestsStatus.innerText = '';

    await runAllTests();

    allTestsStatus.innerText = "All automation test items have been tested";

    // 全測完成後重新啟用各按鈕
    testButtons.forEach(btn => btn.disabled = false);
    enableAllTestButtons();
});

/* === Brightness Cycle === */
document.getElementById('button-brightness-cycle').addEventListener('click', () => runBrightnessCycle());
/**
 * 先連續 ↑ 四次，再連續 ↓ 四次，每次間隔 0.5 秒
*/
function runBrightnessCycle() {
    disableAllTestButtons();
    const brightnessStatusElem = document.getElementById('brightness-up-status');
    brightnessStatusElem.innerHTML = '';

    const TOTAL_CYCLES = 8;      // 總共要送 8 次指令
    const INTERVAL_MS  = 1000;    // 0.5 秒
    let   count        = 0;

    // 建立 spinner 元素
    const spinner = createSpinner();
    brightnessStatusElem.appendChild(spinner);

    const timer = setInterval(() => {
        if (count < 4) {
        // 前四次做 Brightness Up
        mcumgr.smpBrightnessDown();
        } else if (count < 8) {
        // 後四次做 Brightness Down
        mcumgr.smpBrightnessUp();
        }

        count++;

        if (count >= TOTAL_CYCLES) {
        clearInterval(timer);    // 執行完畢就清掉計時器
        brightnessStatusElem.removeChild(spinner);
        brightnessStatusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';
        enableAllTestButtons();
        }
    }, INTERVAL_MS);
    
}
async function runLedCycle() {
    disableAllTestButtons();

    const runLedCycleleStatusElem = document.getElementById('led-off-status');
    runLedCycleleStatusElem.innerHTML = '';
    const spinner = createSpinner();
    runLedCycleleStatusElem.appendChild(spinner);
    
    // ---- 3 次開 / 關循環 ----
    for (let i = 0; i < 3; i++) {
        
        await mcumgr.smpLed();      // 開
        await sleep(500);
        await mcumgr.smpLedoff();   // 關
        await sleep(500);
    }

    // UI：恢復
    runLedCycleleStatusElem.removeChild(spinner);
    runLedCycleleStatusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';

    // enableAllTestButtons();
}

async function runLcdCycle() {
    disableAllTestButtons();
    const lcdStatusElem = document.getElementById('lcd-status');
    lcdStatusElem.innerHTML = '';
    const spinner = createSpinner();
    lcdStatusElem.appendChild(spinner);
    // 防止重覆點擊
    // lcdButton.disabled = true;

    // 五個顏色要執行的函式陣列
    const steps = [
        () => mcumgr.smpLcdRed(),
        () => mcumgr.smpLcdGreen(),
        () => mcumgr.smpLcdBlue(),
        () => mcumgr.smpLcdWhite(),
        () => mcumgr.smpLcdBlack(),
        () => mcumgr.smpLcdRed()
    ];

    // 依序執行，每次等待 3 秒
    for (const step of steps) {
        try {
        await step();                       // 發送指令
        } catch (e) {
        console.error('LCD cmd error:', e); // 發送失敗時印出錯誤但繼續
        }
        await new Promise(r => setTimeout(r, 1500));
    }

    // lcdButton.disabled = false;        // 完成後重新啟用
    lcdStatusElem.removeChild(spinner);
    lcdStatusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';
    enableAllTestButtons();
}


// 輸出 log 按鈕的事件處理
const exportLogButton = document.getElementById("export-log");
// 輸出 XML Log 按鈕事件處理
exportLogButton.addEventListener("click", function () {
    const sw1Status = document.getElementById("sw1-status").textContent.trim();

    // const ledOnStatus = document.getElementById("led-on-status").textContent.trim();
    const ledOffStatus = document.getElementById("led-off-status").textContent.trim();
    const brightnessUpStatus = document.getElementById("brightness-up-status").textContent.trim();
    const speakerStatus = document.getElementById("speaker-status").textContent.trim();
    const lcdStatus = document.getElementById("lcd-status").textContent.trim();


    const batteryStatus = lastBatteryVoltage !== null ? `${lastBatteryVoltage}` : "N/A";
    const compassStatus = document.getElementById("compass-status").textContent.trim();
    const versionStatus = document.getElementById("version-status").textContent.trim();
    // const brightnessDownStatus = document.getElementById("brightness-down-status").textContent.trim();
    // const batteryStatus = document.getElementById("battery-status").textContent.trim();


    // const compassRawValue = document.getElementById("compass-output-status").textContent.trim();
    // 然後在 xmlContent 中加 <TestItem Key="COMPASS_RAW">...</TestItem>



    // 判斷整體測試結果：若兩項皆 PASS 則整體 PASS，否則 FAIL
    let overall = "PASS";
    if (versionStatus.toUpperCase() !== "PASS" || lcdStatus.toUpperCase() !== "PASS" || sw1Status.toUpperCase() !== "PASS" || ledOffStatus.toUpperCase() !== "PASS" || compassStatus.toUpperCase() !== "PASS" || speakerStatus.toUpperCase() !== "PASS" || brightnessUpStatus.toUpperCase() !== "PASS") {
        overall = "FAIL";
    }
    // 取得 S/N 與 BT MAC 輸入欄的值
    const snValue = document.getElementById("sn-input").value.trim();
    const btMacValue = document.getElementById("mac-input").value.trim();

    // 組成檔案名稱，例如 "ms5564P_123456789.xml" 或 "ms5564F_123456789.xml"
    const fileName = `ms5564${overall === "PASS" ? "P" : "F"}_${snValue}.xml`;

    // 產生 XML 格式內容，順序依序為 SN、LEDON、LEDOFF 與 BT_MAC
    const xmlContent = `<TestInfo><TestItem Key="SN">5564110_${snValue}</TestItem><TestItem Key="BT_MAC">${btMacValue}</TestItem><TestItem Key="Keypad1">${sw1Status.toUpperCase()}</TestItem><TestItem Key="LED1">${ledOffStatus.toUpperCase()}</TestItem><TestItem Key="Gsensor">${compassStatus.toUpperCase()}</TestItem><TestItem Key="Buzzer">${speakerStatus.toUpperCase()}</TestItem><TestItem Key="LCD">${lcdStatus.toUpperCase()}</TestItem><TestItem Key="Brightness">${brightnessUpStatus.toUpperCase()}</TestItem><TestItem Key="BAT">${batteryStatus.toUpperCase()}</TestItem><NgInfo><Errcode/><ErrPinDesc/></NgInfo></TestInfo>`;

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



// 修改test button-------------------------------------------------------------------------


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

const groupIds = ['sw1', 'led-off', 'speaker', 'brightness-up', 'lcd'];


document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.content-header h1').innerText = 'BT Connect';

    /*---------------------------------------
    頁面初始化：載入時顯示目前設定狀態
    -----------------------------------------*/
    updateCurrentConfigDisplay();

    // 確保 SW button 的 HTML 元素已載入後，再呼叫 setupSwTest
    groupIds.forEach(setupCheckboxGroup);

    // setupSwTest('sw1', 'sw1-submit', 'sw1-pass', 'sw1-fail', 'sw1-status');
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
        //----------------------------------------------------------------
        // document.getElementById("device-name-input").value = filtered;
        //----------------------------------------------------------------
        document.getElementById("device-name-input").value = 'M' + filtered;
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

document.getElementById('nav-disconnect').addEventListener('click', function (e) {
    e.preventDefault();
    mcumgr.disconnect();
    // 同時更新內容標頭文字
    document.querySelector('.content-header h1').innerText = 'BT connect';
});

/**
 * 建立一個 Spinner 元素，供非同步操作時顯示
 * @returns {HTMLElement} Spinner DOM 元素
 */
function createSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary mt-2';
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="sr-only">Loading...</span>';
    return spinner;
}

/*---------------------------------------
工具函式：更新目前設定顯示區
-----------------------------------------*/
function updateCurrentConfigDisplay() {
    // 從 localStorage 取得最新設定（若有更新）
    desiredVersion = localStorage.getItem("desiredVersion") || desiredVersion;
    batteryMax = localStorage.getItem("batteryMax") || batteryMax;
    batteryMin = localStorage.getItem("batteryMin") || batteryMin;
    const configDisplayElem = document.getElementById('current-config');
    if (configDisplayElem) {
        configDisplayElem.innerHTML = `
        <div>
        <strong style="color: blue;">當前設定檔: </strong>
        </div>
        <div>
        <strong style="color: blue;">Version: ${desiredVersion}</strong>
        </div>
        <div>
        <strong style="color: blue;">Battery: ${batteryMin} ~ ${batteryMax}</strong>
        </div>
        `;
    }
}

/*---------------------------------------
設定檔上傳事件監聽
-----------------------------------------*/
document.getElementById('upload-config').addEventListener('click', () => {
    const fileInput = document.getElementById('config-file');
    const file = fileInput.files[0];
    if (!file) {
        alert("請選擇一個設定檔");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {

        try {
        const config = JSON.parse(e.target.result);
        // 檢查 JSON 內是否包含必要的屬性
        if (config.desiredVersion && config.batteryMax && config.batteryMin) {
            desiredVersion = config.desiredVersion;
            batteryMax = config.batteryMax;
            batteryMin = config.batteryMin;
            // 儲存至 localStorage
            localStorage.setItem("desiredVersion", desiredVersion);
            localStorage.setItem("batteryMax", batteryMax);
            localStorage.setItem("batteryMin", batteryMin);
            document.getElementById('config-message').innerText ="設定檔上傳成功";
            // "設定檔上傳成功，Version 設為 " + desiredVersion +
            // "，Battery 設為 " + batteryMin + "~"  + batteryMax;
            // 更新頁面上目前的設定狀態
            updateCurrentConfigDisplay();
        } else {
            document.getElementById('config-message').innerText =
            "設定檔格式錯誤：缺少必要的屬性";
        }

        } catch (error) {
        document.getElementById('config-message').innerText = "設定檔解析失敗：" + error;
        }
    };
    reader.readAsText(file);
});

/**
 * 通用：綁定 Pass/Fail checkbox 的互斥邏輯與狀態顯示
 * @param {string} id 測項名稱（如 sw1、led、battery）
 */
function setupCheckboxGroup(id) {
    const passChk = document.getElementById(`${id}-pass`);
    const failChk = document.getElementById(`${id}-fail`);
    const statusDom = document.getElementById(`${id}-status`);

    if (!passChk || !failChk || !statusDom) {
        console.warn(`略過 ${id}，缺少必要 DOM`);
        return;
    }

    [passChk, failChk].forEach(chk =>
        chk.addEventListener('change', () => {
        if (chk === passChk && passChk.checked) failChk.checked = false;
        if (chk === failChk && failChk.checked) passChk.checked = false;
        refreshStatus();
    })
    );

    function refreshStatus() {
        if (passChk.checked && !failChk.checked) {
            statusDom.innerHTML = '<span class="badge badge-success">Pass</span>';
            addLogEntry(id.toUpperCase(), 'Pass');
        } else if (failChk.checked && !passChk.checked) {
            statusDom.innerHTML = '<span class="badge badge-danger">Fail</span>';
            addLogEntry(id.toUpperCase(), 'Fail');
            } else {
                statusDom.innerHTML = '<span class="badge badge-warning">N/A</span>';
        }
    }
    refreshStatus(); // 預設初始化
}  

/**
 * 一鍵全測
 * 
 */
async function runTest(testName, commandFunc, statusElemId) {
    const statusElem = document.getElementById(statusElemId);
    // 清空原有狀態並加入 spinner
    statusElem.innerHTML = '';
    const spinner = createSpinner();
    statusElem.appendChild(spinner);

    // 若為 Battery 測試，先設定 pendingBATTERY
    if (testName === 'BATTERY') {
        pendingBATTERY = true;
        batteryResult = null;
    }
    
    // 執行對應的測試指令
    await commandFunc();
    
    // 對於 Battery 測試，可以延長等待時間，例如 1500 毫秒
    const waitTime = testName === 'BATTERY' ? 1500 : GLOBAL_DURATION;
    await delay(waitTime);
    
    // 移除 spinner
    statusElem.removeChild(spinner);

    // 根據全域變數更新狀態
    let result = "N/A";
    switch(testName) {
        case 'VERSION': result = versionResult; break;
        case 'BATTERY': result = batteryResult; break;
        // case 'LED_ON': result = ledOnResult; break;
        // case 'LED_OFF': result = ledOffResult; break;
        case 'COMPASS': result = compassResult; break;
        // case 'SPEAKER': result = speakerResult; break;
        // case 'BRIGHTNESS_UP': result = brightnessUpResult; break;
        // case 'BRIGHTNESS_DOWN': result = brightnessDownResult; break;
        default:
            result = "N/A";
    }
    
    statusElem.innerHTML = result === "Pass"
        ? '<span class="badge badge-success">Pass</span>'
        : '<span class="badge badge-danger">'+result+'</span>';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runManualTestOnly(commandFunc, statusElemId) {
    disableAllTestButtons();
    const statusElem = document.getElementById(statusElemId);
    statusElem.innerHTML = '';
    const spinner = createSpinner();
    statusElem.appendChild(spinner);

    await commandFunc();
    await delay(1000); // 可視實際需求調整

    statusElem.removeChild(spinner);
    statusElem.innerHTML = '<span class="badge badge-warning">N/A</span>';
}

function showNAWithSpinner(statusElemId) {
    const elem = document.getElementById(statusElemId);
    elem.innerHTML = '<span class="badge badge-warning">N/A</span>';
}


async function runAllTests() {
    // 例如：版本測試
    disableAllTestButtons();
    await runTest('VERSION', () => mcumgr.smpVersion(), 'version-status');
    await delay(1500);
    await runTest('BATTERY', () => mcumgr.smpBattery(), 'battery-status');
    await delay(1500);
    await runTest('COMPASS', () => mcumgr.smpCompass(), 'compass-status');
    await delay(1500);4
    
    // await runTest('SPEAKER', () => mcumgr.smpSpeaker(), 'speaker-status');
    // await delay(1500);
    await runManualTestOnly(() => mcumgr.smpSpeaker(), 'speaker-status');
    await delay(1000);
    
    await runLcdCycle();
    await delay(1000);
    
    await runLedCycle();
    await delay(1000);
    
    await runBrightnessCycle();  // 包含自己的 setInterval 控制流程
    await delay(9000);
    

    enableAllTestButtons();
    
}


