# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[('dashboard.html', '.'), ('js/index.js', 'js'), ('js/cbor.js', 'js'), ('js/mcumgr.js', 'js'), ('css/bootstrap-grid.css', 'css'), ('css/bootstrap-grid.css.map', 'css'), ('css/bootstrap-grid.min.css', 'css'), ('css/bootstrap-grid.min.css.map', 'css'), ('css/bootstrap-reboot.css', 'css'), ('css/bootstrap-reboot.css.map', 'css'), ('css/bootstrap-reboot.min.css', 'css'), ('css/bootstrap-reboot.min.css.map', 'css'), ('css/bootstrap.css', 'css'), ('css/bootstrap.css.map', 'css'), ('css/bootstrap.min.css', 'css'), ('css/bootstrap.min.css.map', 'css'), ('css/mcumgr.css', 'css')],
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
    upx=True,
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
    upx=True,
    upx_exclude=[],
    name='server',
)
