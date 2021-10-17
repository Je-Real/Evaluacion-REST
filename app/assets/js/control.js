function go(where) {
    setCookie('USelected', where)
    window.location.href = String(location.href).slice(0, 21+1)+"encuesta/"
}