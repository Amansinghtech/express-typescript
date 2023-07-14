export const env = {
	secret: process.env.SECRET || 'supersecret',
	AccessTokenExpiry: '2m',
	mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/notes',
}
