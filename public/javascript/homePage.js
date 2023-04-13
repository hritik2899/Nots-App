

var exampleModal = document.getElementById('staticBackdrop');

exampleModal.addEventListener('show.bs.modal', function (event) {
    // Button that triggered the modal

    // var button = event.relatedTarget
    const button = event.relatedTarget
    const noteDiv = button.parentElement.parentElement;

    // Extract info from data-bs-* attributes
    // var recipient = button.getAttribute('data-bs-whatever')
    let title = noteDiv.children[0].innerText;
    let note = noteDiv.children[1].innerText;
    // If necessary, you could initiate an AJAX request here
    // and then do the updating in a callback.
    //
    // Update the modal's content.
    var modalTitle = exampleModal.querySelector('.modal-title')
    var modalBodyInput = exampleModal.querySelector('.modal-body input')
    let modalnote = exampleModal.querySelector('.modal-body textarea')


    modalTitle.textContent = 'Edit Note'
    modalBodyInput.value = title;
    modalnote.value = note;
})

