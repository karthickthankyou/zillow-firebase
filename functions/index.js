const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.becomeAgent = functions.https.onCall((data, context) => {
  if (!context.auth) {
    return { message: 'Authentication required!', code: 401 }
  }

  const uid = context.auth.uid
  const customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'agent',
      'x-hasura-allowed-roles': ['user', 'agent'],
      'x-hasura-user-id': uid,
    },
  }

  return admin
    .auth()
    .setCustomUserClaims(uid, customClaims)
    .then(() => {
      const metadataRef = admin.database().ref('metadata/' + uid)
      return metadataRef.set({ refreshTime: new Date().getTime() })
    })
    .catch((error) => {
      console.log('error', JSON.stringify(error))
      return { success: false, error: JSON.stringify(error) }
    })
})

// On sign up.
exports.processSignUpIkea = functions.auth.user().onCreate((user) => {
  const customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': user.uid,
    },
  }

  return admin
    .auth()
    .setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      const metadataRef = admin.database().ref('metadata/' + user.uid)
      return metadataRef.set({ refreshTime: new Date().getTime() })
    })
    .catch((error) => {
      console.log(error)
    })
})
