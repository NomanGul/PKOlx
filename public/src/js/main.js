const config = {
  apiKey: "AIzaSyCek1I7W14it5lYjOxhQI_EctNpdFsOExQ",
  authDomain: "pakolx-41f1c.firebaseapp.com",
  databaseURL: "https://pakolx-41f1c.firebaseio.com",
  projectId: "pakolx-41f1c",
  storageBucket: "pakolx-41f1c.appspot.com",
  messagingSenderId: "329604896905"
};
firebase.initializeApp(config);

const fbdb = firebase.firestore();
const auth = firebase.auth();
const storeRef = firebase.storage().ref();
const messaging = firebase.messaging();
const modal = document.querySelector('.custom-modal');
const loader = document.querySelector('.custom-loader');


if(localStorage.getItem('userUid')){
  if(location.pathname === '/signin.html' || location.pathname === '/signup.html'){
      location.assign('/index.html');
  }
}else{
  if(location.pathname !== '/signin.html'){
      if(location.pathname !== '/signup.html'){
        location.assign('/signin.html');
      }
  }
}

function showModal(message){
  modal.querySelector('.custom-modal-body').innerText = message;
  modal.style.display = 'block';
  setTimeout(()=>{
    modal.style.top = '50%';
    modal.style.opacity = '1';    
  },100)

  setTimeout(hideModal,4000);
}



function hideModal(){
  setTimeout(()=>{
    modal.style.display = 'none';
  },500);
  modal.style.top = 'calc(50% - 100px)';
  modal.style.opacity = '0';    
}



function showLoader(message){
  loader.querySelector('span').innerText = message;
  loader.style.display = 'flex';
  setTimeout(()=>{
    loader.style.opacity = '1';    
  },100)
}



function hideLoader(){
  setTimeout(()=>{
    loader.style.display = 'none';
  },500);
  loader.style.opacity = '0';    
}

function logout(){
  showLoader('Logging out...');
  fbdb.collection('users').doc(currentUserUid).set({deviceToken:null},{merge: true})
    .then(()=>{
      return auth.signOut()
    })
    .then(()=>{
      hideLoader();
      window.localStorage.removeItem('userUid');
      window.localStorage.removeItem('currentUserName');      
      location.assign('/signin.html');
    })
}
function openMenu(){
  const menu = document.querySelector('#side-menu');
  menu.style.opacity = '1';
  menu.style.transform = 'translateX(0)';
}
function closeMenu(){
  const menu = document.querySelector('#side-menu'); 
  menu.style.opacity = '0';  
  menu.style.transform = 'translateX(-500px)';   
}

function readURLParam(parameter){
  let url = new URL(window.location.href);
  let param = url.searchParams.get(parameter);
  return param;
}


if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(reg => {
      console.log("SW Registered");
      reg.pushManager
        .subscribe({
          userVisibleOnly: true
        })
        .then(function(subscription) {
          console.log("subscription:", subscription.toJSON());
          // GCM were used this endpoint
          console.log("endpoint:", subscription.endpoint);
        });
    })
    .catch(function(error) {
      console.log("SW Registration Failed: :^(", error);
    });
}
