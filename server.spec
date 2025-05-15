# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('dashboard.html', '.'),
        ('css/bootstrap.min.css', 'css'),
        ('css/fontawesome.min.css', 'css'),
        ('css/adminlte.min.css', 'css'),
        ('css/mcumgr.css', 'css'),
        ('css/all.min.css', 'css'),
        ('js/jquery.min.js', 'js'),
        ('js/bootstrap.bundle.min.js', 'js'),
        ('js/adminlte.min.js', 'js'),
        ('js/cbor.js', 'js'),
        ('js/mcumgr.js', 'js'),
        ('js/index.js', 'js'),
        ('webfonts', 'webfonts'),
        ('css/img', 'css/img'),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='server',
)
