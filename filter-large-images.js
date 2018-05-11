const fs = require('fs')
const path = require('path')
const sharp = require('sharp');

let fileList = []
let rulerSize = 1024 * 350   // 用于过滤大于这个尺寸的文件，单位KB, 修改350这个值即可
const comporessedImagePath = 'compress-image'
process.argv.map(val => {
  if (val.split('=')[0] === 'minSize') {
    rulerSize = Math.abs(parseInt(val.split('=')[1])) * 1024
  }
})

function walk(path) {  
  const dirList = fs.readdirSync(path);   

  dirList.map(item => {
    const states = fs.statSync(`${path}/${item}`)

    if (states.isDirectory()) {
      walk(`${path}/${item}`)
    } else {
      if (isAnImageFile(item) && isFileSizeLargerThanRuler(states.size, rulerSize)){
        const file = {
          path: `${path}/${item}`,
          size: states.size
        }
        fileList.push(file)

        if (!fs.existsSync(comporessedImagePath)) {
          fs.mkdirSync(comporessedImagePath)
        }

        sharp(`${path}/${item}`)
        .toFile(`${comporessedImagePath}/${renamePathMark(path, item)}`, (err, info) => {
          if (err) {
            console.log(`提取${path}/${item}时报错:`, err)
          }
        })
      }
    }
  })
} 

/**
 * 
 * @param {*} file 判断是否是图片文件
 */
function isAnImageFile(file) {
  const pattern = new RegExp(/\.(png|jpe?g)?$/)
  return pattern.test(file)
}

/**
 * 
 * @param {*} fileSize 文件的尺寸，以字节为单位
 * @param {*} rulerSize 比较的尺寸，以字节为单位
 */
function isFileSizeLargerThanRuler(fileSize, rulerSize) {
  return fileSize > rulerSize
}

/**
 * 替换文件路径中的斜线 / , 转换为^符号，例如 src/img/index.png -> src^img^&$index.png
 * @param {*String} path 文件路径
 * @param {*String} item 文件名
 */
function renamePathMark(filePath, item) {
  return filePath.replace(/\//g, '^') + '^&$' + item
}


// 清空目标文件夹下的文件
function deleteFolderRecursive(path) {

  var files = [];

  if( fs.existsSync(path) ) {

      files = fs.readdirSync(path);

      files.forEach(function(file,index){

          var curPath = path + "/" + file;

          if(fs.statSync(curPath).isDirectory()) { // recurse

              deleteFolderRecursive(curPath);

          } else { // delete file

              fs.unlinkSync(curPath);

          }

      });

      fs.rmdirSync(path);

  }

};


deleteFolderRecursive(comporessedImagePath)
walk('src');
console.log(fileList.length);  

if (process.argv.some(val => val === 'bySize')) {
  fileList = fileList.sort((a, b) => b.size - a.size)
}
// fileList.map(item => console.log(item.path, `${parseInt(item.size/1024)}KB`))