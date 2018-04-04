const http = require('http')
const path = require('path')
const fs = require('fs')
const async = require('async')

let boardId = '43038689'
    downloadCount = 0
    images = []
    downloadPath = 'img/'
    url =`http://huaban.com/boards/${boardId}/?md=newbn&beauty=&jfjdy1xx&max=&limit=20&wfl=1`
    imgBaseUrl = 'http://img.hb.aicdn.com/'
    imageType = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/bmp': '.bmp',
      'image/gif': '.gif',
      'image/x-icon': '.ico',
      'image/tiff': '.tif',
      'image/vnd.wap.wbmp': '.wbmp'
    }

// 发起请求方法
let fetchData = (url, cb) => {
  console.log('开始抓取画板信息...')
  http.get(url, res => {
    let dataArr = []
    res.on('data', data => {
      dataArr.push(data)
    })
    res.on('end', () => {
      let data = Buffer.concat(dataArr)
      let html = data.toString()
      let obj = getBoardsObj(html)
      // 画板图片总数量
      let count = obj.pin_count
      images = images.concat(obj.pins)
      console.log(`已抓取到${images.length}张图片地址`)
      if(images.length == count || count == 0){
        // 停止抓取
        console.log('抓取完毕...即将下载...')
        cb()
        return
      }
      let newUrl = loadMore(url) // 加载更多
      fetchData(newUrl,downloadAll)
    })
  }).on('error', err => {
    console.log(err)
  })
}

// 获取画板数据
let getBoardsObj = html => {
  let match = /app.page\["board"\]\s=\s([\s\S]*?);/i.exec(html)[1]
  return JSON.parse(match)
}

// 加载更多

let loadMore = url => {
  let nextUrl = url.replace(/max=\d*&/,`max=${images[images.length-1].pin_id}&`)
  return nextUrl
}

// 下载图片
let download = (image, cb) => {
  let imgUrl = imgBaseUrl + image.file.key
  let filename = image.file.id + imageType[image.file.type]
  let filePath = downloadPath + filename
  if(fs.existsSync(filePath)){
    console.log('图片'+ filename + '已存在...')
    downloadCount++
    cb(null,'图片已存在')
  } else {
    // 创建一个写入流
    let ws = fs.createWriteStream(filePath)
    ws.on('finish', () => {
      console.log(`${filename}已下载/n总进度:第${downloadCount++}张`)
      cb(null,filename + '下载成功')
    })

    http.get(imgUrl, res => {
      res.pipe(ws)
    }).on('finish',() => {
      console.log('http请求完成' + imgUrl)
    }).on('error', err => {
      console.log(err)
    })
  }
}

// 
let downloadAll = () => {
  // 创建名为画板ID的文件夹
  downloadPath = downloadPath + boardId + '/'
  mkdirsSync(downloadPath)
  // 控制并发数量
  async.mapLimit(images, 3, (image, cb) => {
    // 下载
    download(image, cb)
  },(err,re) => {
    console.log('下载完成情况' + re)
  })
}

// 判断文件夹是否存在 不存在则创建
let mkdirsSync = dirname =>{
  if(fs.existsSync(dirname)){
    return true
  } else if(mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname)
    return true
  }
}

fetchData(url, downloadAll)