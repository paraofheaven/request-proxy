import 'whatwg-fetch';

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

const parseJSON = response => {
  return response.json();
}

module.exports = ({ url, method = 'GET', data }) => {
  return new Promise((resolve, reject) => {
    let requestUrl = url;

    let params = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    };

    if (method === 'POST') {
      params.body = JSON.stringify(data);
    } else {
      requestUrl += '?';

      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          let value = data[key];
          if (value) requestUrl += `${key}=${data[key]}`;
        }
      }
    }

    fetch(requestUrl, params)
      .then(checkStatus)
      .then(parseJSON)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
