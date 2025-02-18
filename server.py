## test
import http.server
import socketserver

PORT = 8000  # 你可以改成別的 Port
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"本機伺服器運行於：http://localhost:{PORT}")
    httpd.serve_forever()

