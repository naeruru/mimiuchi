async function post(url: string, body: any) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(async (response) => {
      response.json().then(json => resolve(json))
    }).catch((err) => {
      reject(err)
    })
  })
}

export default { post }
