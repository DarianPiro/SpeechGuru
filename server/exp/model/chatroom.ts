import mongoose from './db'
const { Schema } = mongoose;
const chatroomSchema = new Schema({
  chatroomId: String,
  AI_id: String,
  targetLanguage: String,
  AI_image: String,
  AI_name: String,
  userIds: [String],
  users: [String],
  nativeLanguage:String,
  messages: [
    {
      messageId: String,
      senderId: String,
      senderName: String,
      timeStamp: String,
      text: String,
      audio: String,
      translatedText: String,
    },
  ],
});
export default mongoose.model('chatrooms',chatroomSchema)

