import fetch from 'node-fetch';

const baseUrl = 'http://127.0.0.1:8080';

function postData(url, data) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + url, {
      method: 'POST',
      body: JSON.stringify(data),
      mode: 'cors',
      headers: {
        "Accept":"application/json",
        "Content-Type":"application/x-www-form-urlencoded"
      }
    }).then(res => {
      resolve(res);
    }).catch(err => {
      console.log(err);
      reject(err);
    })
  })
}

export {postData};
