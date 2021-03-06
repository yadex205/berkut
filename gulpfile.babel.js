import gulp from 'gulp'
import ejs from 'gulp-ejs'
import sass from 'gulp-sass'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import livereload from 'gulp-livereload'
import concat from 'gulp-concat'
import sourcemaps from 'gulp-sourcemaps'
import markdown from 'marked'
import electron from 'electron'
import rimraf from 'rimraf'

var spawn = require('child_process').spawn
var fs = require('fs')

var targetDir = 'htdocs'
var plumberOptions = {
    errorHandler: notify.onError('Error <%= error.message %>')
}
var isLive = process.argv[2] === 'live'
var aboutDoc = markdown(fs.readFileSync('etc/about_berkut.md').toString())

let isReload = false

gulp.task('default')

gulp.task('build', ['html', 'css', 'js'])

gulp.task('live', ['build'], () => {
    livereload.listen()

    let appProcess

    const createApp = function () {
        const app = spawn(electron, ['.'])
        app.stdout.on('data', (buffer) => {
            console.log(`${buffer}`)
        })

        app.stderr.on('data', (buffer) => {
            console.log(`${buffer}`)
        })

        app.on('close', () => {
            if (!isReload) {
                process.exit(1)
            } else {
                isReload = false
                appProcess = createApp()
            }
        })
        return app
    }

    appProcess = createApp()

    gulp.watch('src/html/**/*.ejs', ['html'])
    gulp.watch('src/css/**/*.scss', ['css'])
    gulp.watch('src/js/**/*.js', ['js'])
    gulp.watch(['index.js', 'lib/**/*.js'], () => {
        isReload = true
        appProcess.kill()
    })
})

gulp.task('clean', (callback) => {
    rimraf(targetDir, callback)
})

gulp.task('html', () => {
    gulp.src(['src/html/**/*.ejs', '!src/html/**/_*.ejs'])
        .pipe(plumber(plumberOptions))
        .pipe(ejs({
            isLive: isLive,
            blendTechniques: require('./etc/blend_techniques.json'),
            aboutDoc: aboutDoc,
            version: require('./package.json').version
        }, {
            ext: '.html'
        }))
        .pipe(gulp.dest(targetDir))
        .pipe(livereload())
})

gulp.task('css', () => {
    gulp.src([
        'bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css',
        'src/css/**/*.scss'])
        .pipe(plumber(plumberOptions))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
        }))
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(`${targetDir}/css`))
        .pipe(livereload())
})

gulp.task('js', () => {
    gulp.src([
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
        'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js',
        'src/js/**/*.js'])
        .pipe(plumber(plumberOptions))
        .pipe(sourcemaps.init())
        .pipe(concat('index.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(`${targetDir}/js`))
        .pipe(livereload())
})
