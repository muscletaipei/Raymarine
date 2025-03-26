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

// 從 localStorage 讀取 desiredVersion，若沒有則預設為 "3.7.90"
let desiredVersion = localStorage.getItem("desiredVersion") || "3.7.90";
let batteryMax = localStorage.getItem("batteryMax") || "3000";
let batteryMin = localStorage.getItem("batteryMin") || "2000";

// 新增全域變數，記錄按鈕是否等待回應
let pendingLEDON = false;
let pendingLEDOFF = false;
let pendingCOMPASS = false;
let pendingSPEAKER = false;
let pendingBRIGHTNESSUP = false;
let pendingBRIGHTNESSDOWN = false;
let pendingBATTERY = false;
let pendingVERSION = false;

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
const ledButton = document.getElementById('button-led');
const ledOffButton = document.getElementById('button-led-off');
const compassButton = document.getElementById('button-compass');
const speakerButton = document.getElementById('button-speaker');
const brightnessButtonUp = document.getElementById('button-brightness-up');
const brightnessButtonDown = document.getElementById('button-brightness-down');
const batteryButton = document.getElementById('button-battery');
const versionButton = document.getElementById('button-version');
const runAllButton = document.getElementById('button-run-all');
const allTestsStatus = document.getElementById('all-tests-status');

const testButtons = [
    document.getElementById('button-version'),
    document.getElementById('button-led'),
    document.getElementById('button-led-off'),
    document.getElementById('button-compass'),
    document.getElementById('button-speaker'),
    document.getElementById('button-brightness-up'),
    document.getElementById('button-brightness-down'),
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

    versionButton.disabled = false;
    versionButton.classList.remove('disabled');

    // 在 onConnect 回呼中重置 LED 狀態
    // resetAllSwStatus();
    document.getElementById('sw1-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw2-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw3-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw4-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw5-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw6-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw7-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw8-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw9-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw10-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw11-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw12-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw13-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw14-status').innerHTML = '<span class="badge badge-warning">N/A</span>';

    document.getElementById('version-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';;
    document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
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
    document.getElementById('sw2-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw3-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw4-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw5-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw6-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw7-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw8-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw9-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw10-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw11-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw12-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw13-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('sw14-status').innerHTML = '<span class="badge badge-warning">N/A</span>';

    document.getElementById('version-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-on-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('led-off-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('compass-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('speaker-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-up-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('brightness-down-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
    document.getElementById('battery-status').innerHTML = '<span class="badge badge-warning">N/A</span>';
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
            else if (output === "compass: ok") {
                // const compassStatusElem = document.getElementById('compass-status');
                // compassStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("COMPASS", "PASS");
                compassResult = "Pass";
                pendingCOMPASS = false;
            }
            // Speaker 回應處理
            else if (output === "speaker ok") {
                // const speakerStatusElem = document.getElementById('speaker-status');
                // speakerStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("SPEAKER", "PASS");
                speakerResult = "Pass";
                pendingSPEAKER = false;
            }
            // Brightness Up 回應處理
            else if (output === "brightness up") {
                // const brightnessUpStatusElem = document.getElementById('brightness-up-status');
                // brightnessUpStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("BRIGHTNESSUP", "PASS");
                brightnessUpResult = "Pass";
                pendingBRIGHTNESSUP = false;
            }
            // Brightness Down 回應處理
            else if (output === "brightness down") {
                // const brightnessDownStatusElem = document.getElementById('brightness-down-status');
                // brightnessDownStatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
                // addLogEntry("BRIGHTNESSDOWN", "PASS");
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

// 按鈕事件處理
// // 取得 SW1 按鈕與狀態顯示區
// // 1. 限制 SW1 兩個勾選框只能選一個
// document.querySelectorAll('.sw1-checkbox').forEach(function(chk) {
//     chk.addEventListener('change', function() {
//         if (this.checked) {
//             // 當某一個被選中，將其他同組勾選框取消選取
//             document.querySelectorAll('.sw1-checkbox').forEach(function(other) {
//                 if (other !== chk) {
//             other.checked = false;
//             }
//         });
//         }
//     });
//     });
//   // 2. 提交 SW1 測試結果
// document.getElementById('sw1-submit').addEventListener('click', function() {
//     // 讀取兩個勾選框的狀態
//     const passChk = document.getElementById('sw1-pass');
//     const failChk = document.getElementById('sw1-fail');
//     let result = "";

//     if (passChk.checked && !failChk.checked) {
//         result = "Pass";
//     } else if (failChk.checked && !passChk.checked) {
//         result = "Fail";
//     } else {
//         alert("請勾選 Pass 或 Fail (只選一個)！");
//         return;
//     }

//     // 根據結果更新 badge 顯示
//     const sw1StatusElem = document.getElementById('sw1-status');
//     if (result === "Pass") {
//         sw1StatusElem.innerHTML = '<span class="badge badge-success">Pass</span>';
//     } else {
//         sw1StatusElem.innerHTML = '<span class="badge badge-danger">Fail</span>';
//     }

//     // 將結果記錄到 log 中 (假設已定義 addLogEntry 函式)
//     addLogEntry("SW1", result);
//     });


versionButton.addEventListener('click', async () => {
        pendingVERSION = true;
        versionResult = null;  //add result
        // versionButton.disabled = true;
        // versionButton.classList.add('disabled');

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
    });

ledButton.addEventListener('click', async () => {
    // 禁用按鈕，並加入 disabled 樣式（AdminLTE3/Bootstrap 會自動處理灰色顯示）
    pendingLEDON = true;
    ledOnResult = null;  //add result
    //反灰
    // ledButton.disabled = true;
    // ledButton.classList.add('disabled');

    // 取得 LED ON 狀態區域（原本顯示 "N/A"）
    const ledOnStatusElem = document.getElementById('led-on-status');
    // 清空原有內容
    ledOnStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    ledOnStatusElem.appendChild(spinner);

    await mcumgr.smpLed();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        ledOnStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示（這裡以 ledOnResult 為例）
        ledOnStatusElem.innerHTML = ledOnResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
});

ledOffButton.addEventListener('click', async () => {
    pendingLEDOFF = true;
    ledOffResult = null;  //add result
    // ledOffButton.disabled = true;
    // ledOffButton.classList.add('disabled');

    // 取得 LED OFF 狀態區，清空原內容（原先可能顯示 "N/A"）
    const ledOffStatusElem = document.getElementById('led-off-status');
    ledOffStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    ledOffStatusElem.appendChild(spinner);

    await mcumgr.smpLedoff();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        ledOffStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示（這裡以 ledOnResult 為例）
        ledOffStatusElem.innerHTML = ledOffResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
});

compassButton.addEventListener('click', async () => {
    pendingCOMPASS = true;
    compassResult = null;  //add result
    // compassButton.disabled = true;
    // compassButton.classList.add('disabled');

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
});
speakerButton.addEventListener('click', async () => {
    pendingSPEAKER = true;
    speakerResult = null;
    // speakerButton.disabled = true;
    // speakerButton.classList.add('disabled');

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
        speakerStatusElem.innerHTML = speakerResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
});
brightnessButtonUp.addEventListener('click', async () => {
    pendingBRIGHTNESSUP = true;
    brightnessUpResult = null;
    // brightnessButtonUp.disabled = true;
    // brightnessButtonUp.classList.add('disabled');

    // 取得 brightness up 狀態區，清空原內容（原先可能顯示 "N/A"）
    const brightnessUpStatusElem = document.getElementById('brightness-up-status');
    brightnessUpStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    brightnessUpStatusElem.appendChild(spinner);

    await mcumgr.smpBrightnessUp();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        brightnessUpStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示
        brightnessUpStatusElem.innerHTML = brightnessUpResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
});
brightnessButtonDown.addEventListener('click', async () => {
    pendingBRIGHTNESSDOWN = true;
    brightnessDownResult = null;
    // brightnessButtonDown.disabled = true;
    // brightnessButtonDown.classList.add('disabled');

    // 取得 brightness down 狀態區，清空原內容（原先可能顯示 "N/A"）
    const brightnessDownStatusElem = document.getElementById('brightness-down-status');
    brightnessDownStatusElem.innerHTML = '';

    // 建立 spinner 元素
    const spinner = createSpinner();
    brightnessDownStatusElem.appendChild(spinner);

    await mcumgr.smpBrightnessDown();
    
    // 模擬進度結束後移除 spinner 並更新狀態
    setTimeout(() => {
        brightnessDownStatusElem.removeChild(spinner);
        // 根據回應結果更新狀態顯示
        brightnessDownStatusElem.innerHTML = brightnessDownResult === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
    }, GLOBAL_DURATION);    
});
batteryButton.addEventListener('click', async () => {
    pendingBATTERY = true;
    batteryResult = null;
    // batteryButton.disabled = true;
    // batteryButton.classList.add('disabled');

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
});

// 輸出 log 按鈕的事件處理
const exportLogButton = document.getElementById("export-log");
// 輸出 XML Log 按鈕事件處理
exportLogButton.addEventListener("click", function () {
    // 取得 LED ON 與 LED OFF 的狀態文字
    const sw1Status = document.getElementById("sw1-status").textContent.trim();
    const sw2Status = document.getElementById("sw2-status").textContent.trim();
    const sw3Status = document.getElementById("sw3-status").textContent.trim();
    const sw4Status = document.getElementById("sw4-status").textContent.trim();
    const sw5Status = document.getElementById("sw5-status").textContent.trim();
    const sw6Status = document.getElementById("sw6-status").textContent.trim();
    const sw7Status = document.getElementById("sw7-status").textContent.trim();
    const sw8Status = document.getElementById("sw8-status").textContent.trim();
    const sw9Status = document.getElementById("sw9-status").textContent.trim();
    const sw10Status = document.getElementById("sw10-status").textContent.trim();
    const sw11Status = document.getElementById("sw11-status").textContent.trim();
    const sw12Status = document.getElementById("sw12-status").textContent.trim();
    const sw13Status = document.getElementById("sw13-status").textContent.trim();
    const sw14Status = document.getElementById("sw14-status").textContent.trim();


    const ledOnStatus = document.getElementById("led-on-status").textContent.trim();
    const ledOffStatus = document.getElementById("led-off-status").textContent.trim();
    const compassStatus = document.getElementById("compass-status").textContent.trim();
    const speakerStatus = document.getElementById("speaker-status").textContent.trim();
    const brightnessUpStatus = document.getElementById("brightness-up-status").textContent.trim();
    const brightnessDownStatus = document.getElementById("brightness-down-status").textContent.trim();
    const batteryStatus = document.getElementById("battery-status").textContent.trim();

    // 判斷整體測試結果：若兩項皆 PASS 則整體 PASS，否則 FAIL
    let overall = "PASS";
    if (sw14Status.toUpperCase() !== "PASS" ||sw13Status.toUpperCase() !== "PASS" ||sw12Status.toUpperCase() !== "PASS" ||sw11Status.toUpperCase() !== "PASS" ||sw10Status.toUpperCase() !== "PASS" ||sw9Status.toUpperCase() !== "PASS" ||sw8Status.toUpperCase() !== "PASS" ||sw7Status.toUpperCase() !== "PASS" ||sw6Status.toUpperCase() !== "PASS" ||sw5Status.toUpperCase() !== "PASS" ||sw4Status.toUpperCase() !== "PASS" || sw3Status.toUpperCase() !== "PASS" || sw2Status.toUpperCase() !== "PASS" ||sw1Status.toUpperCase() !== "PASS" || ledOnStatus.toUpperCase() !== "PASS" || ledOffStatus.toUpperCase() !== "PASS" || compassStatus.toUpperCase() !== "PASS" || speakerStatus.toUpperCase() !== "PASS" || brightnessUpStatus.toUpperCase() !== "PASS" || brightnessDownStatus.toUpperCase() !== "PASS" || batteryStatus.toUpperCase() !== "PASS") {
        overall = "FAIL";
    }
    // 取得 S/N 與 BT MAC 輸入欄的值
    const snValue = document.getElementById("sn-input").value.trim();
    const btMacValue = document.getElementById("mac-input").value.trim();

    // 組成檔案名稱，例如 "ms5564P_123456789.xml" 或 "ms5564F_123456789.xml"
    const fileName = `ms5564${overall === "PASS" ? "P" : "F"}_${snValue}.xml`;

    // 產生 XML 格式內容，順序依序為 SN、LEDON、LEDOFF 與 BT_MAC
    const xmlContent = `<TestInfo><TestItem Key="SN">ms${snValue}</TestItem><TestItem Key="BT_MAC">${btMacValue}</TestItem><TestItem Key="SW1">${sw1Status.toUpperCase()}</TestItem><TestItem Key="SW2">${sw2Status.toUpperCase()}</TestItem><TestItem Key="SW3">${sw3Status.toUpperCase()}</TestItem><TestItem Key="SW4">${sw4Status.toUpperCase()}</TestItem><TestItem Key="SW5">${sw5Status.toUpperCase()}</TestItem><TestItem Key="SW6">${sw6Status.toUpperCase()}</TestItem><TestItem Key="SW7">${sw7Status.toUpperCase()}</TestItem><TestItem Key="SW8">${sw8Status.toUpperCase()}</TestItem><TestItem Key="SW9">${sw9Status.toUpperCase()}</TestItem><TestItem Key="SW10">${sw10Status.toUpperCase()}</TestItem><TestItem Key="SW11">${sw11Status.toUpperCase()}</TestItem><TestItem Key="SW12">${sw12Status.toUpperCase()}</TestItem><TestItem Key="SW13">${sw13Status.toUpperCase()}</TestItem><TestItem Key="SW14">${sw14Status.toUpperCase()}</TestItem><TestItem Key="LEDON">${ledOnStatus.toUpperCase()}</TestItem><TestItem Key="LEDOFF">${ledOffStatus.toUpperCase()}</TestItem><TestItem Key="COMPASS">${compassStatus.toUpperCase()}</TestItem><TestItem Key="SPEAKER">${speakerStatus.toUpperCase()}</TestItem><TestItem Key="BRIGHTNESSUP">${brightnessUpStatus.toUpperCase()}</TestItem><TestItem Key="BRIGHTNESSDOWN">${brightnessDownStatus.toUpperCase()}</TestItem><TestItem Key="BATTERY">${batteryStatus.toUpperCase()}</TestItem></TestInfo>`;

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

runAllButton.addEventListener('click', async () => {
    // 禁用所有獨立測試按鈕
    testButtons.forEach(btn => btn.disabled = true);
    allTestsStatus.innerText = '';

    await runAllTests();

    allTestsStatus.innerText = "All automation test items have been tested";

    // 全測完成後重新啟用各按鈕
    testButtons.forEach(btn => btn.disabled = false);
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

// 在此加入 Device ID 顯示更新邏輯
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.content-header h1').innerText = 'BT Connect';

    /*---------------------------------------
    頁面初始化：載入時顯示目前設定狀態
    -----------------------------------------*/
    updateCurrentConfigDisplay();

    // 確保 SW button 的 HTML 元素已載入後，再呼叫 setupSwTest
    setupSwTest('sw1', 'sw1-submit', 'sw1-pass', 'sw1-fail', 'sw1-status');
    setupSwTest('sw2', 'sw2-submit', 'sw2-pass', 'sw2-fail', 'sw2-status');
    setupSwTest('sw3', 'sw3-submit', 'sw3-pass', 'sw3-fail', 'sw3-status');
    setupSwTest('sw4', 'sw4-submit', 'sw4-pass', 'sw4-fail', 'sw4-status');
    setupSwTest('sw5', 'sw5-submit', 'sw5-pass', 'sw5-fail', 'sw5-status');
    setupSwTest('sw6', 'sw6-submit', 'sw6-pass', 'sw6-fail', 'sw6-status');
    setupSwTest('sw7', 'sw7-submit', 'sw7-pass', 'sw7-fail', 'sw7-status');
    setupSwTest('sw8', 'sw8-submit', 'sw8-pass', 'sw8-fail', 'sw8-status');
    setupSwTest('sw9', 'sw9-submit', 'sw9-pass', 'sw9-fail', 'sw9-status');
    setupSwTest('sw10', 'sw10-submit', 'sw10-pass', 'sw10-fail', 'sw10-status');
    setupSwTest('sw11', 'sw11-submit', 'sw11-pass', 'sw11-fail', 'sw11-status');
    setupSwTest('sw12', 'sw12-submit', 'sw12-pass', 'sw12-fail', 'sw12-status');
    setupSwTest('sw13', 'sw13-submit', 'sw13-pass', 'sw13-fail', 'sw13-status');
    setupSwTest('sw14', 'sw14-submit', 'sw14-pass', 'sw14-fail', 'sw14-status');
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
 * 設定 SW 測試按鈕的事件處理
 * @param {string} swName 測試項目的名稱（例如 "SW1"）
 * @param {string} submitButtonId 提交按鈕的 ID
 * @param {string} passCheckboxId Pass 勾選框的 ID
 * @param {string} failCheckboxId Fail 勾選框的 ID
 * @param {string} statusElemId 狀態顯示區元素的 ID
 */
// 設定 SW 測試按鈕事件處理
function setupSwTest(swName, submitButtonId, passCheckboxId, failCheckboxId, statusElemId) {
    // 限制同組勾選框只能選一個，假設勾選框的 class 名稱為 "{swName}-checkbox"（例如 "SW1-checkbox"）
    document.querySelectorAll(`.${swName}-checkbox`).forEach(chk => {
        chk.addEventListener('change', function() {
            if (this.checked) {
                document.querySelectorAll(`.${swName}-checkbox`).forEach(other => {
                    if (other !== chk) {
                        other.checked = false;
                    }
                });
            }
        });
    });
    
    // 設定提交按鈕事件
    const submitButton = document.getElementById(submitButtonId);
    const statusElem = document.getElementById(statusElemId);
    submitButton.addEventListener('click', function() {
        const passChk = document.getElementById(passCheckboxId);
        const failChk = document.getElementById(failCheckboxId);
        let result = "";
        // 如果未勾選或兩者都勾選，則跳出提示
        if (passChk.checked && !failChk.checked) {
            result = "Pass";
        } else if (failChk.checked && !passChk.checked) {
            result = "Fail";
        } else {
            alert("請勾選 Pass 或 Fail (只選一個)！");
            return;
        }
        // 根據結果更新狀態顯示，覆蓋原先 "N/A"
        statusElem.innerHTML = result === "Pass"
            ? '<span class="badge badge-success">Pass</span>'
            : '<span class="badge badge-danger">Fail</span>';
        // 呼叫記錄 log 的函式（假設已定義 addLogEntry 函式）
        addLogEntry(swName, result);
    });
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
        case 'LED_ON': result = ledOnResult; break;
        case 'LED_OFF': result = ledOffResult; break;
        case 'COMPASS': result = compassResult; break;
        case 'SPEAKER': result = speakerResult; break;
        case 'BRIGHTNESS_UP': result = brightnessUpResult; break;
        case 'BRIGHTNESS_DOWN': result = brightnessDownResult; break;
        case 'BATTERY': result = batteryResult; break;
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


async function runAllTests() {
    // 例如：版本測試
    await runTest('VERSION', () => mcumgr.smpVersion(), 'version-status');

    await runTest('LED_ON', () => mcumgr.smpLed(), 'led-on-status');
    await runTest('LED_OFF', () => mcumgr.smpLedoff(), 'led-off-status');
    await runTest('COMPASS', () => mcumgr.smpCompass(), 'compass-status');
    await runTest('SPEAKER', () => mcumgr.smpSpeaker(), 'speaker-status');
    await runTest('BRIGHTNESS_UP', () => mcumgr.smpBrightnessUp(), 'brightness-up-status');
    await runTest('BRIGHTNESS_DOWN', () => mcumgr.smpBrightnessDown(), 'brightness-down-status');
    await runTest('BATTERY', () => mcumgr.smpBattery(), 'battery-status');
}


