import os
import re

def adjust_css_paths(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.css'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 修改 ../webfonts 路徑
                content = re.sub(r'url\([\'"]?\.\./webfonts/', 'url(webfonts/', content)
                # 修改 ../img 路徑
                content = re.sub(r'url\([\'"]?\.\./img/', 'url(img/', content)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ 已調整: {file_path}")

# 用法：把 'css' 換成你的 CSS 資料夾名稱
adjust_css_paths('css')
