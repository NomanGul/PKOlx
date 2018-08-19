let recieverUid;
const message_section = document.querySelector('#messages-section');
const message_container = document.querySelector('#message-container');
const send_message = document.querySelector('#message-form');
const typed_message = send_message.querySelector('input[type="text"]');
let roomId;
let recieverName;

send_message.addEventListener('submit', event => {
    event.preventDefault();
    if(typed_message.value.trim().length < 1){
        showModal('Plz Write Hi');
        return false;
    }
    showLoader('Sending...');
    const userMessage = typed_message.value;
    fbdb.collection('rooms').doc(roomId).collection('messages').add({
        message : userMessage,
        senderId: currentUserUid,
        senderName: currentUsername,
        receiverId: recieverUid,
        timeStamp: Date.now()
    })
    .then( () => {
        typed_message.value = '';
        hideLoader();
    })
})

window.addEventListener('load', () => {
    if(navigator.onLine){
        recieverUid =  readURLParam('id');
        showLoader('Chats Loading...');
        fbdb.collection('rooms').where(`users.${currentUserUid}`,'==',true).where(`users.${recieverUid}`,'==',true)
            .onSnapshot(async querySnapshot => {
                await fbdb.collection('users').doc(recieverUid).get().then( snapshot => {
                    recieverName = snapshot.data().username;
                    otherUserAvatar = snapshot.data().avatar;
                })
                if(querySnapshot.empty){
                    showModal("Messages Empty");           
                    fbdb.collection('rooms').add({
                        users : {
                            [currentUserUid] : true,
                            [recieverUid] : true
                        },
                        usersInfo : [
                            {
                                name: currentUsername,
                                uid: currentUserUid
                            },{
                                name: recieverName,
                                uid: recieverUid
                            }
                        ]
                    }).then( snapshot => {
                        hideLoader();   
                        roomId = snapshot.id;
                    })
                } else{
                    console.log('Room Found');
                    querySnapshot.forEach( snapshot => {
                        roomId = snapshot.id;
                        loadMessages();
                    })
                } 
            })
    }else{
        hideLoader();
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are Offline :(</h2>
                <a href="/favourites.html" class="btn btn-primary">See your Favourite ads</a>
            </div>
        `
    }
});

function loadMessages(){
    fbdb.collection('rooms').doc(roomId).collection('messages').orderBy('timeStamp')
        .onSnapshot( querySnapshot => {
            hideLoader();
            if(querySnapshot.empty){
                showModal("Chats Empty");
                return false;
            }
            querySnapshot.docChanges().forEach( snapshot => {
                let chatObject = snapshot.doc.data();
                message_container.innerHTML += `
                    <div class="message-outer ${chatObject.senderId === currentUserUid ? 'right-message-outer': 'left-message-outer'}">
                        <span class="avatar-message mx-2" style="background-image:url(${chatObject.senderId === currentUserUid ? currentUserAvatar : otherUserAvatar})"></span>
                        <li class="list-group-item message">
                            <span>${chatObject.message}</span>
                        </li>                
                    </div>
                    `
                scrollToBottom();
            })
        })
}

function scrollToBottom(){
    message_section.scrollTop = message_section.scrollHeight;
}