const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore.document('rooms/{roomId}/messages/{messageId}')
.onWrite((change, context) => {
    const receiverId = change.after.data().receiverId;
    const senderId = change.after.data().senderId;
    const name = change.after.data().senderName;
    const payload = {
        notification: {
            title: `New Message from ${name}`,
            body: change.after.data().message,
            status: 'Wohoo its work',
            click_action: `https://pakolx-41f1c.firebaseapp.com/chat.html?id=${senderId}`
        }
    }
    return admin.firestore().collection('users').doc(receiverId).get()
    .then((snapshot) => {
        const data = snapshot.data();
        const token = data.deviceToken;
        return admin.messaging().sendToDevice(token, payload);
    });
})