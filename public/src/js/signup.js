const form = document.querySelector('form');
const usernameEl = document.querySelector('#username');
const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');
const password2El = document.querySelector('#password2');
const profilePictureEl = document.querySelector('#profile-picture');

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    showLoader('Creating account...');

    if(usernameEl.value.length < 1 ||password2El.value.length < 1  || passwordEl.value.length < 1 || emailEl.value.length < 1){
        showModal('All fields are required!');
        password2El.value = '';
        passwordEl.value = '';
        hideLoader();
        return false;
    }
    if(password2El.value !== passwordEl.value){
        showModal("Plz, type correct Password");
        hideLoader();
        password2El.value = '';
        passwordEl.value = '';
        return false;
    }
    console.log(profilePictureEl.files.length)
    if(profilePictureEl.files.length < 1){
        showModal('Plz, upload your avatar');
        password2El.value = '';
        passwordEl.value = '';
        hideLoader();
        return false;
    }
    auth.createUserWithEmailAndPassword(emailEl.value,passwordEl.value)
        .then((snapshot)=>{
            const file = profilePictureEl.files[0];
            const name = `${file.name}-${Date.now()}`;
            const metaData = {contentType: file.type};

            storeRef.child(`avatars/${name}`).put(file,metaData)
                .then(()=>{
                    return storeRef.child(`avatars/${name}`).getDownloadURL()
                })
                .then((url)=>{
                    return fbdb.collection('users').doc(snapshot.user.uid).set({
                        email: emailEl.value,
                        username: usernameEl.value,
                        avatar: url
                    })
                })
                .then(()=>{
                    console.log('User created');
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
        .catch(err =>{
            showModal(err.message);
            hideLoader();
            clearFields();
        })
})

function clearFields(){
    usernameEl.value = '';
    emailEl.value = '';
    passwordEl.value = '';
    password2El.value = '';
}