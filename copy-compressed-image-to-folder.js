// 将compress-image目录中的图片copy到原有的位置

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const comporessedImagePath = 'compress-image'

/**
 * 将图片文件名解析，并生成文件原有的路径和文件名
 * @param {* string } fileName 
 */
function parseImageFileToPathAndFile(fileName) {
  let [filePath, imageName] = fileName.split('^&$')
  filePath = filePath.replace(/\^/g, '/')

  return {
    filePath, imageName
  }
}

/**
 * 将图片原路放回
 */
function putBack() {
  fs.readdir(comporessedImagePath, (err, files) => {
    files.map(file => {
      const { filePath, imageName } = parseImageFileToPathAndFile(file)
      // console.log(`${filePath}/${imageName}`);

      fs.copyFileSync(`${comporessedImagePath}/${file}`, `${filePath}/${imageName}`, (err) => {
        if (err) throw err;
      });

    })
  })
}

putBack()