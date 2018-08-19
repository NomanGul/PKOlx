let currentUserUid;
let currentUsername;
let currentUserAvatar;

// Functions related to Home and post ads
document.addEventListener('DOMContentLoaded',()=>{
   if(localStorage.getItem('userUid')){
    showLoader('Setting up page...');
    currentUserUid = localStorage.getItem('userUid');
    requestToken();

    if(localStorage.getItem('currentUserName')){
        currentUsername = localStorage.getItem('currentUserName');
        currentUserAvatar = localStorage.getItem('currentUserAvatar');
        renderPage();
    } else{
        fbdb.collection('users').doc(currentUserUid)
            .get()
            .then((snapshot)=>{
                currentUsername = snapshot.data().username;
                currentUserAvatar = snapshot.data().avatar;
                localStorage.setItem('currentUserName',currentUsername);
                localStorage.setItem('currentUserAvatar',currentUserAvatar);
                renderPage();
            })
       }
    }
})

function renderPage(){
    let greetUserEl = document.querySelector('#greet-user');
    let avatarEl = greetUserEl.querySelector('#avatar');
    greetUserEl.innerHTML = `
            <span class="avatar-container mx-2" style="background-image:url('${currentUserAvatar}');"></span>
            ${currentUsername}
        `;
}

function requestToken(){
    messaging.requestPermission().then(function() {
        console.log('Notifications Accessed!');
        return messaging.getToken()
    }).then(function(currentToken) {
        fbdb.collection('users').doc(currentUserUid).set({deviceToken: currentToken},{merge: true})
    }).catch(function(err) {
        console.log('Notifications Denied :(', err);
    });
    
    messaging.onMessage((payload) => {
        console.log(payload)
    })
}

// Functions related to Home page
function fetchAds(){
    const container = document.querySelector('.container');
    if(navigator.onLine){
        showLoader('Fetching ads...');
        fbdb.collection('ads').onSnapshot((querySnapshot)=>{
            if(querySnapshot.empty){
                showModal('No ads');
                hideLoader();
                container.innerHTML = `
                    <div class="jumbotron text-center">
                        <h2>No ad is available</h2>
                        <a href="/addPost.html" class="btn btn-primary">Post an add</a>
                    </div>
                `
                return false;
            }
            querySnapshot.docChanges().forEach((snapshot)=>{
                hideLoader();               
                if(snapshot.type === 'added'){
                    renderAds(snapshot.doc.data(),snapshot.doc.id);
                }
            })
        })
    }else{
        hideLoader();
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are offline but you can still see your Favourite ads</h2>
                <a href="/favourites.html" class="btn btn-primary">See your Favourite ads</a>
            </div>
        `
    }
}

function renderAds(ads,id){
    const adsContainer = document.querySelector('#ads-container');
    adsContainer.innerHTML += `
    <div class="custom-card">
        <div class="custom-card-body">
            <div class="image-container" style="background-image:url('${ads.downloadURL}')">
            <button class="fav-btn btn btn-danger heart-btn" onClick="addToOffline('${id}')"><i class="far fa-heart"></i></button>
                <div class="price-label bg-primary">$${ads.productPrice}</div>            
            </div>
            <div class="details">
                <span>Category:</span>
                <span>${ads.productCategory}</span>
            </div>
            <div class="details">
                <span>Name:</span>
                <span>${ads.productName}</span>
            </div>
            <div class="details">
                <span>Model:</span>
                <span>${ads.productModel}</span>
            </div>
            <div class="details">
                <button class="btn btn-primary" onClick="showDescription('${id}')"><i class="fas fa-info-circle"></i></button>
                <!--<button class="btn btn-primary" onClick="routeToMessage('${ads.sellerUid}')">Contact Seller</button>-->
                <i class="fab fa-facebook-messenger" onClick="routeToMessage('${ads.sellerUid}')"></i>
            </div>
        </div>
        <div class="custom-card-back" data-id="${id}" onClick="hideDescription('${id}')">
            <p>${ads.productDescription}</p>
        </div>
    </div>
`
}

function addToOffline(id){
    showLoader('Adding offline...');
    let adsArr = [];
    if(localStorage.getItem('ads')){
        adsArr = JSON.parse(localStorage.getItem('ads'));
    }
    for(let i=0; i < adsArr.length; i++){
        if(adsArr[i].id === id){
            showModal('Already in Favouites');
            hideLoader();
            return false;
        }
    }
    fbdb.collection('ads').doc(id)
        .get()
        .then((snapshot)=>{
            const dataSnapshot = {
                id,
                downloadURL: snapshot.data().downloadURL,
                productCategory: snapshot.data().productCategory,
                productDescription: snapshot.data().productDescription,
                productModel: snapshot.data().productModel,
                productName: snapshot.data().productName,
                productPrice: snapshot.data().productPrice,
                sellerName: snapshot.data().sellerName,
                sellerUid: snapshot.data().sellerUid,                
            }
            adsArr.push(dataSnapshot);
            localStorage.setItem('ads',JSON.stringify(adsArr))
            const req = new Request(snapshot.data().downloadURL,{ mode: 'no-cors' });
            caches.open('static')
                .then((cache)=>{
                    fetch(req)
                        .then((response)=>{
                            hideLoader();
                            showModal('Ad is now available offline');
                            return cache.put(req,response);
                        })
                })
        })
}
function showDescription(id){
    let descriptionEl = document.querySelector(`div[data-id='${id}']`);
    descriptionEl.style.display = 'flex';
    setTimeout(()=>descriptionEl.style.opacity = '0.9',100);
}

function hideDescription(id){
    let descriptionEl = document.querySelector(`div[data-id='${id}']`);
    descriptionEl.style.opacity = '0';
    setTimeout(()=>descriptionEl.style.display = 'none',500);
}

function searchAds(){
    showLoader('Searching...');
    const searchTypeEl = document.querySelector('#search-form select');
    const userSearchEl = document.querySelector('#search-form input[type="text"]');
    const searchLabelEl = document.querySelector('#search-label');

    if(searchTypeEl.value === '0'){
        showModal('Plz, select any Filter');
        hideLoader();
        return false;
    }
    if(userSearchEl.value.length < 1){
        showModal('Plz, write something');
        hideLoader();
        return false;
    }
    if(searchTypeEl.value === 'name'){
        fbdb.collection('ads').where('productName','==',userSearchEl.value)
            .get()    
            .then((querySnapshot)=>{
                hideLoader();
                if(querySnapshot.empty){
                    showModal('No Results!');
                    return false;
                }
                searchLabelEl.style.display = 'flex';
                searchLabelEl.querySelector('.left-content').innerText = `Showing results for ${userSearchEl.value}`;            
                const adsContainer = document.querySelector('#ads-container').innerHTML = '';                
                querySnapshot.forEach((snapshot)=>{
                    renderAds(snapshot.data(),snapshot.id);
                })
            })
            .catch((err)=>{
                showModal(err.message);
                hideLoader();
            })
    }

    if(searchTypeEl.value === 'category'){
        fbdb.collection('ads').where('productCategory','==',userSearchEl.value)
            .get()
            .then((querySnapshot)=>{
            hideLoader();
            if(querySnapshot.empty){
                showModal('No Results!');
                return false;
            }
            searchLabelEl.style.display = 'flex';
            searchLabelEl.querySelector('.left-content').innerText = `Showing results for ${userSearchEl.value}`;        
            const adsContainer = document.querySelector('#ads-container').innerHTML = '';            
            querySnapshot.forEach((snapshot)=>{
                renderAds(snapshot.data(),snapshot.id);                
            })
        })
        .catch((err)=>{
            showModal(err.message);
            hideLoader();
        })

    }
    return false;
}


function cancelSearch(){
    const adsContainer = document.querySelector('#ads-container').innerHTML = '';    
    const searchLabelEl = document.querySelector('#search-label');
    searchLabelEl.style.display = 'none';
    fetchAds();
}

function routeToMessage(sellerUid){
    location.assign(`/chat.html?id=${sellerUid}`);
}

// Functions related to Submit Ads Page
function submitAdd(){
    showLoader('Submitting...');

    // DOM Shortcuts
    const productCategory = document.querySelector('#product-category');
    const productName = document.querySelector('#product-name');
    const productModel = document.querySelector('#product-model');
    const productDescription = document.querySelector('#product-description');
    const productPrice = document.querySelector('#product-price');    
    const productImage = document.querySelector('#product-image');
    
    if(productCategory.value === '0'){
        showModal('Plz, select a category');
        hideLoader();
        return false;
    }
    if(productName.value.trim().length < 1 ||productDescription.value.trim().length < 1|| productPrice.value.trim().length < 1 || productModel.value.trim().length < 1 ||productImage.files.length < 1){
        showModal('All fields are required!');
        hideLoader();
        return false;
    }

    const file = productImage.files[0];
    const name = Date.now() + '-' + file.name;
    const metaData = {contentType: file.type};

    storeRef.child(`ads/${name}`).put(file,metaData)
        .then(()=>{
            return storeRef.child(`ads/${name}`).getDownloadURL();
        })
        .then((url)=>{
            const data = {
                productCategory : productCategory.value,
                productName : (productName.value).toLowerCase(),
                productDescription : productDescription.value,
                productModel : productModel.value,
                productPrice: productPrice.value,
                downloadURL : url,
                sellerUid : currentUserUid,
                sellerName : currentUsername
            }
            writeDatabase(data);
        })
        .catch(err =>{
            showModal(err.message);
            hideLoader();
        })
    return false;
}

function writeDatabase(data){
    fbdb.collection('ads')
    .add(data)
    .then(()=>{
        clearAdForm();
        showModal('Your ad has been submitted!');
        hideLoader();
        setTimeout(()=> location.assign('../../index.html'),2000);
    })
    .catch((err)=>{
        showModal(err.message)
        hideLoader();
    })
}
function clearAdForm(){
    hideLoader();
    if(!navigator.onLine){
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are offline but you can still see your Favourite ads</h2>
                <a href="/favourites.html" class="btn btn-primary">See your Favourite ads</a>
            </div>
        `
    }
    const productCategory = document.querySelector('#product-category').value = '0';    
    const productName = document.querySelector('#product-name').value = '';
    const productModel = document.querySelector('#product-model').value = '';
    const productDescription = document.querySelector('#product-description').value = '';
}

// Functions related to Offline page
function renderSaveAds(){
    const mainContainer = document.querySelector('.container');
    const container = document.querySelector('#ads-container');
    hideLoader();
    if(!localStorage.getItem('ads')){
        showModal('No ads added');
        mainContainer.innerHTML = `
            <h2 class="jumbotron text-center">Nothing to show</h2>
        `
        return false;
    }
    const adsArr = JSON.parse(localStorage.getItem('ads'));
    adsArr.forEach((ad)=>{
        container.innerHTML += `
        <div class="custom-card">
            <div class="custom-card-body">
                <div class="image-container" style="background-image:url('${ad.downloadURL}')">
                    <div class="price-label bg-primary">${ad.productPrice}$</div>            
                </div>
                <div class="details">
                    <span>Category:</span>
                    <span>${ad.productCategory}</span>
                </div>
                <div class="details">
                    <span>Name:</span>
                    <span>${ad.productName}</span>
                </div>
                <div class="details">
                    <span>Model:</span>
                    <span>${ad.productModel}</span>
                </div>
                <div class="details">
                    <button class="btn btn-primary" onClick="showDescription('${ad.id}')"><i class="fas fa-info-circle"></i></button>
                </div>
            </div>
            <div class="custom-card-back" data-id="${ad.id}" onClick="hideDescription('${ad.id}')">
                <p>${ad.productDescription}</p>
            </div>
        </div>
    `    
    })
}
