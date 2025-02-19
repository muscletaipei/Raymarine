###  Web Bluetooth API ###
import http.server
import socketserver
import webbrowser
import time

PORT = 8000  # 你可以改成別的 Port
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    url = f"http://localhost:{PORT}/dashboard.html"
    print(f"本機伺服器運行於：{url}")

    # 延遲 1 秒，確保伺服器已啟動後再打開瀏覽器
    time.sleep(1)
    webbrowser.open(url)

    httpd.serve_forever()


