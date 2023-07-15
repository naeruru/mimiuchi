const webhook = {
    post : async function(url: string, body: any) {
        console.log(body)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Private-Network': "true",
                    "Access-Control-Allow-Origin": '*',
                },
                body: JSON.stringify(body)
            }).then(response => {
                console.log('hi')
                return response.json()
            }).then(data => {
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}

export default webhook