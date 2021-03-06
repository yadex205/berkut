const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const mimedb = require('mime-db')
const Iconv = require('iconv-lite')

/*
const EXTENSIONS = Object.keys(mimedb).filter((type) => {
    return type.startsWith('video') || type.startsWith('image')
}).map((type) => {
    return mimedb[type].extensions
}).filter((extensions) => {
    return extensions !== null && extensions !== undefined
}).reduce((prev, current) => {
    return prev.concat(current)
})
 */

const EXTENSIONS = [
    'jpg', 'png', 'gif',
    'mp4', 'avi', 'mov', 'mkv'
]

const HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']

const filter = function(rawResult) {
    return rawResult.split('\n').filter((filename) => {
        const result  =
                  filename !== ''
                  && !filename.includes('/node_modules/')
                  && !filename.includes('/.git/')
                  && !filename.includes('/bower_components/')
        return result
    })
}

const searcher = {
    win32: function(root, callback) {
        let result = ''
        const wildcards = EXTENSIONS.map((ext) => { return `*.${ext}` })
        const proc = spawn('where', ['/r', root].concat(wildcards))
        proc.stdout.on('data', (data) => {
            result += Iconv.decode(data, 'CP932')
        })
        proc.on('close', () => {
            callback(filter(result))
        })
    },
    darwin: function(root, callback) {
        let result = ''
        const condition = EXTENSIONS.map((ext) => {
            return `kMDItemDisplayName == "*.${ext}"`
        }).join(' || ')
        const proc = spawn('mdfind', ['-onlyin', root, '-name', condition])
        proc.stdout.on('data', (data) => {
            result += data
        })
        proc.on('close', () => {
            callback(filter(result))
        })
    }
}

module.exports = function(callback, root) {
    if (!root) {
        let videoDir
        switch(process.platform) {
        case 'win32': videoDir = 'Videos'; break
        case 'darwin': videoDir = 'Movies'; break
        }
        root = HOME + path.sep + videoDir
    }
    searcher[process.platform](root, callback)
}
