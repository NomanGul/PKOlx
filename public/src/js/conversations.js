const conversationsContainer = document.querySelector('#inbox-container');
const container = document.querySelector('.container');

window.addEventListener('load', () => {
    if(navigator.onLine){
        fbdb.collection('rooms').where(`users.${currentUserUid}`,'==',true).onSnapshot( querySnapshot => {
            hideLoader();
            if(querySnapshot.empty){
                showModal("You haven't chat with anyone");
                container.innerHTML = `
                        <div class="jumbotron text-center">
                            <h2>No Conservations</h2>
                        </div>
                    `
                return false;
            }
            querySnapshot.docChanges().forEach(async snapshot => {
                if(snapshot.type === 'added'){
                    const data = snapshot.doc.data();
                    let otherUserObj;
                    let otherUid;
                    data.usersInfo.forEach( user => {
                        if(user.uid !== currentUserUid){
                            otherUserObj = user;
                        }
                    })
                    await fbdb.collection('users').doc(otherUserObj.uid)
                        .get()
                        .then( snapshot => {
                            otherUserObj = snapshot.data();
                            otherUid = snapshot.id;
                        })
                    conversationsContainer.innerHTML += `
                                <div class="message-outer" onClick="routeToMessage('${otherUid}')">
                                    <span class="avatar-message mx-2" style="background-image:url(${otherUserObj.avatar})"></span>
                                    <li class="list-group-item message">
                                        <span class="left-content">${otherUserObj.username}</span>
                                        <span class="right-content"><img src='/src/images/right-arrow.png' alt="right arrow" style="width: 20px">
                                    </li>                
                                </div>
                            `
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
})

function routeToMessage(otherUserUid){
    location.assign(`chat.html?id=${otherUserUid}`);
}