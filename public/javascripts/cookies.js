function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

    options = {
        path: '/', // 경로 지정
        ...options // 아규먼트로 옵션을 넘겨줬을경우 전개연산자로 추가 갱신
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString(); // 생 Date 객체라면 형식에 맞게 인코딩
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) { // 밸류가 없다면
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie; // 새로 갱신
}

function deleteCookie(name) { // 해당 쿠키 요소만 삭제
    setCookie(name, "", {
        'max-age': -1
    })
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        deleteCookie(name.trim());
    }
    console.log('all cookies deleted !')
}