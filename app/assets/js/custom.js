function darkMode() {
    $('body').addClass('dark')
    if ($('*').hasClass('bg-light')) {
        $('*').removeClass('bg-light')
        $('*').addClass('bg-dark')
    }
}