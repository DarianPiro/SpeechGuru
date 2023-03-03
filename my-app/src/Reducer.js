const initialState = {
  chatroomId: "6400a272301f4a1e487c320b",
  AI_id: "ChatGPTEnglish",
  language: "English",
  AI_image: "AI Image",
  AI_name: "William",
  userId: "josh",
  user_name: "Josh",
  NativeLanguage: "French",
  messages: [
    {
      messageId: "",
      senderId: "",
      senderName: "",
      timeStamp: "",
      text: "",
      translatedText: "",
    },
  ],
};
const GETCHATROOMMESSAGES = "getChatRoomMessages";
const UPDATEMESSAGES = "updatemessages";
export default function Reducer(state = initialState, action) {
  switch (action.type) {
    case GETCHATROOMMESSAGES: {
      const newState = { ...action.payload };
      return newState;
    }
    case UPDATEMESSAGES: {
      const newState = {...action.payload };
      return newState;
    }
    default:
      return state;
  }
}