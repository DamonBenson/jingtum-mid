import fetch from 'node-fetch';

function postData(url, data) {
  return new Promise((resolve, reject) => {
    fetch(url, {
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