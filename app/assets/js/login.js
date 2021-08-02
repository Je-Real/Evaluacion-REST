var toggler = false
var frame = document.getElementById('floatingLogin')
var backpanel = document.getElementById('backPanel')
var glass = document.getElementById('layoutSidenav')

function toggleLogin() {
    if(toggler){
        frame.className = frame.className.replace('d-flex', 'd-none')
        backpanel.className = backpanel.className.replace('d-block', 'd-none')
        glass.className = ''
        console.log('Off')
    }
    else{
        frame.className = frame.className.replace('d-none', 'd-flex')
        backpanel.className = backpanel.className.replace('d-none', 'd-block')
        if(glass.className == 'blur-off'){
            glass.className = glass.className.replace('blur-off', 'blur-on')
        } else {
            glass.className = 'blur-on position-fixed'
        }
        document.getElementById('user').focus()
        console.log('On')
    }

    toggler = !toggler
}

/*<div id="glass" class="d-none w-100 h-100 position-fixed bg-dark-50"></div>*/