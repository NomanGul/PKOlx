const form = document.querySelector('form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');

form.addEventListener('submit', e => {
    e.preventDefault();
    showLoader('Signing in...');
    if(password.value.length < 1 || email.value.length < 1){
        showModal('All fields are Required!');
        hideLoader();
        return false;
    }

    auth.signInWithEmailAndPassword(email.value, password.value)
        .then( snapshot => {
            hideLoader();
            clearFields();            
            localStorage.setItem('userUid',snapshot.user.uid);
            location.assign('../../index.html');
        })
        .catch(err =>{
            showModal(err.message);
            hideLoader();
            clearFields();
        })
})

function clearFields(){
    email.value = '';
    password.value = '';
}