var toggler = false
var frame = document.getElementById('floatingLogin')
var glass = document.getElementById('glass')

function toggleLogin() {
    if(toggler){
        frame.className = frame.className.replace('d-block', 'd-none')
        glass.className = glass.className.replace('d-block', 'd-none')
        console.log('Off')
    }
    else{
        frame.className = frame.className.replace('d-none', 'd-block')
        glass.className = glass.className.replace('d-none', 'd-block')
        console.log('On')
    }

    toggler = !toggler
}

/*<div id="glass" class="d-none w-100 h-100 position-fixed bg-dark-50"></div>*/