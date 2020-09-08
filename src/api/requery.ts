
export function GetFloor(url:string) {
    return new Promise(
        function (resolve, reject) {
            window.fetch(url).then(function (data) {
                resolve(data.json())
            })
        }
    )
}