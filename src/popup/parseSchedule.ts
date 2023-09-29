export async function getAuthToken() {
    return await new Promise((resolve, reject) => {
        chrome.cookies.get(
            {url: 'https://my.itmo.ru', name: 'auth._id_token.itmoId'},
            function (cookie) {
                if (cookie) {
                    resolve(cookie.value);
                } else {
                    reject('Can\'t get cookie');
                }
            }
        );
    });
}


export async function getSchedule() {
    const authToken = await getAuthToken();
    console.log(authToken);
}
