const http = require('http')
const fs = require('fs')
const request = require('request')
let imgBaseUrl = 'http://img.hb.aicdn.com/'

// let req = http.request({
//   methods:'get',
//   path:'/',
//   host:'huaban.com',
//   headers:{
//     'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
//   }
// }, res => {
//   if(res.statusCode == 200){
//     let dataArr = []
//     res.on('data', data => {
//       dataArr.push(data)
//     })
//     res.on('end', () => {
//       let data =  Buffer.concat(dataArr)
//       let str = data.toString()
//       let matchs = /app.page\["recommends"\]\s=\s([\s\S]*?);/i.exec(str)
//       fs.writeFile('./temp.js',matchs[1],() => {

//       })

//       let arr = JSON.parse(matchs[1])
//       let coverArr = []
//       arr.forEach(el => {
//         getImg(el.cover.key)
//       })
//     })
//   }
// })
// req.end()

let sendReq = (path, regStr) => {
  let opts = {
    methods:'get',
    path:path,
    host:'huaban.com',
    headers:{
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    }
  }
  let req = http.request(opts ,res => {
    if(res.statusCode == 200){
      let dataArr = []
      res.on('data', data => {
        dataArr.push(data)
      }) 
      res.on('end', () => {
        let data = Buffer.concat(dataArr)
        let str = data.toString()
        let reg = new RegExp(`app.page\\["${regStr}"\\]\\s=\\s([\\s\\S]*?);`)
        console.log(reg)
        let matchs = reg.exec(str)
        let arr = JSON.parse(matchs[1])
        fs.writeFile('./beauty.js',matchs[1],() => {})
        // arr.forEach(el => {
        //   getImg(el.file.key)
        // });
      })
    }

  })
  req.end()
}

let getImg = hash => {
  request(imgBaseUrl+hash).pipe(fs.createWriteStream('./img/' + hash + '.jpg'))
}


sendReq('/favorite/beauty/','boards')