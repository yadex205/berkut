// index.js

if (process.platform === 'win32') {
    process.env['VLC_PLUGIN_PATH'] = require('path').join(
        __dirname,
        'node_modules/wcjs-prebuilt/bin/plugins'
    )
}

const electron = require('electron')

const {app} = electron
const {BrowserWindow}= electron

let dashboardWindow

function createWindow () {
    dashboardWindow = new BrowserWindow({
        width: 1024,
        minWidth: 1024,
        height: 700,
        minHeight: 700
    })
    dashboardWindow.loadURL(`file://${__dirname}/htdocs/index.html`)
    app.on('closed', () => {
        dashboardWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    switch(process.platform) {
    case 'darwin': app.quit()
    }
})

app.on('activate', (dashboardWindow === null) ? createWindow : ()=>{})
