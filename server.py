###  Web Bluetooth API ###
# pyinstaller --add-data "dashboard.html;." --add-data "js/index.js;js" --add-data "js/cbor.js;js" --add-data "js/mcumgr.js;js" --add-data "css/bootstrap-grid.css;css" --add-data "css/bootstrap-grid.css.map;css" --add-data "css/bootstrap-grid.min.css;css" --add-data "css/bootstrap-grid.min.css.map;css" --add-data "css/bootstrap-reboot.css;css" --add-data "css/bootstrap-reboot.css.map;css" --add-data "css/bootstrap-reboot.min.css;css" --add-data "css/bootstrap-reboot.min.css.map;css" --add-data "css/bootstrap.css;css" --add-data "css/bootstrap.css.map;css" --add-data "css/bootstrap.min.css;css" --add-data "css/bootstrap.min.css.map;css" --add-data "css/mcumgr.css;css" server.py

# import sys, os
# if getattr(sys, 'frozen', False):
#     os.chdir(sys._MEIPASS)

# import http.server
# import socketserver
# import webbrowser
# import time



# PORT = 8000  # 你可以改成別的 Port
# Handler = http.server.SimpleHTTPRequestHandler

# with socketserver.TCPServer(("", PORT), Handler) as httpd:
#     url = f"http://localhost:{PORT}/dashboard.html"
#     print(f"本機伺服器運行於：{url}")

#     # 延遲 1 秒，確保伺服器已啟動後再打開瀏覽器
#     time.sleep(3)
#     webbrowser.open(url)

#     httpd.serve_forever()

import sys
import os
import http.server
import socketserver
import webbrowser
import time

# 切換工作目錄（EXE 模式用）
if getattr(sys, 'frozen', False):
    os.chdir(sys._MEIPASS)

# 印 debug 資訊
# print(f"sys.frozen: {getattr(sys, 'frozen', False)}")
# if getattr(sys, 'frozen', False):
#     print(f"sys._MEIPASS: {sys._MEIPASS}")
# print(f"Current working directory: {os.getcwd()}")
# print(f"目錄檔案列表： {os.listdir()}")
# if os.path.isdir('css'):
#     print(f"CSS 資料夾： {os.listdir('css')}")
# if os.path.isdir('js'):
#     print(f"JS 資料夾： {os.listdir('js')}")

# 啟動伺服器
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    url = f"http://localhost:{PORT}/dashboard.html"
    print(f"本機伺服器運行於：{url}")
    time.sleep(3)
    webbrowser.open(url)
    httpd.serve_forever()

