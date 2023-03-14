import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveMessage, AIresponse } from '../../ApiService';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import VoiceRecording from './VoiceRecording';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

export default function ChatDisplayFooter() {
  const chatroom = useSelector((state: RootState) => state.ChatReducer);
  const dispatch = useDispatch();

  // state to handle the text input field
  const [Text, SetText] = useState('');
  const changeTxt = function (
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    SetText(event.target.value);
  };

  const handleSubmit = async function (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (Text.length > 0) {
      // create a unique message id
      const messageId = uuidv4();
      const newTimeStamp = Date.now();
      // create the data to be send to the database
      const data = {
        AI_id: chatroom.chatroomId,
        AI_image: chatroom.AI_image,
        AI_name: chatroom.AI_name,
        userId: chatroom.userId,
        nativeLanguage: chatroom.nativeLanguage,
        chatroomId: chatroom.chatroomId,
        user_name: chatroom.user_name,
        targetLanguage: chatroom.targetLanguage,
        // user_name: "Josh",
        messages: {
          messageId: messageId,
          senderId: chatroom.userId,
          senderName: chatroom.user_name,
          timeStamp: newTimeStamp,
          text: Text,
          audio: '',
          translatedText: '',
        },
      };
      console.log('clicked');
      // reset the inout field
      SetText('');
      //save the message to the database
      const chatroomDetail = await saveMessage(data);

      // update the message on the front end
      dispatch({ type: 'updatemessages', payload: chatroomDetail });

      // make a response call to ChatGPT and display the new message after a delay for better UX
      const delayTime = Math.floor(Math.random() * (4000 - 2000) + 2000);
      setTimeout(() => {
        dispatch({ type: 'istyping', payload: true });
      }, 1000);
      setTimeout(async () => {
        const response = await AIresponse(chatroomDetail);
        dispatch({ type: 'updatemessages', payload: response });
        dispatch({ type: 'istyping', payload: false });
      }, delayTime);
    }
  };

  return (
    <form className="message_footer_wrapper" data-testid="message_footer_wrapper" onSubmit={handleSubmit}>
      <VoiceRecording />
      <input
        className="footer_input"
        type="text"
        onChange={changeTxt}
        name="message"
        value={Text}
        required={true}
        placeholder="Type a message here"
        autoComplete="off"
      ></input>
      <button type="submit" data-testid="send" className="send" style={{ border: 'none', background: 'none' }}>
        <FontAwesomeIcon icon={faPaperPlane as IconDefinition} />
      </button>
    </form>
  );
}
