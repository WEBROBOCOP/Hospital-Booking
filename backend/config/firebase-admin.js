const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

// Initialize Firebase Admin only if it hasn't been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

module.exports = admin 