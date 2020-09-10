import * as https from 'https';
import * as querystring from 'querystring';
import CryptoJS = require('crypto-js');

export const translate = (word:string) => {

  function truncate(q:string) {
    const len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
  }

  const appKey = '64dc80fc254339df';
  const key = '6cQ69HWC5M0rc8hriHb5cApebbgzjHic';
  const salt = (new Date).getTime();
  const curtime = Math.round((new Date).getTime() / 1000);
  const str1 = appKey + truncate(word) + salt + curtime + key;

  const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
  const query = querystring.stringify({
    q: word,
    appKey: appKey,
    salt: salt,
    from: 'auto',
    to: 'en',
    sign: sign,
    signType: 'v3',
    curtime: curtime
  });
  const options = {
    hostname: 'openapi.youdao.com',
    port: 443,
    path: '/api?' + query,
    method: 'GET',
  };

  const request = https.request(options, (response) => {
    let chunks:Buffer[] = [];
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString();
      type YoudaoResult = {
        errorCode: string,
        translation: [],
        basic?: {            // 词义
          explains: []
        }
        l: string   // 源语言和目标语言
      }
      const object: YoudaoResult = JSON.parse(string);
      if (object.errorCode !== '0') {
        console.log('翻译失败');
        process.exit(2)
      } else {
        object.basic ? object.basic.explains.map(item=>console.log(item)) : console.log(object.translation);
        process.exit(0)
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};