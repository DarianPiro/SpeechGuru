import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneLines } from '@fortawesome/free-solid-svg-icons/faMicrophoneLines';
import { faCircleStop } from '@fortawesome/free-solid-svg-icons/faCircleStop';
import {
  sendingRecord,
  saveMessage,
  AIresponse,
  getVoiceResponse,
} from '../../ApiService';
import MicRecorder from 'mic-recorder-to-mp3';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

export default function VoiceRecording(props: Props) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer);
  const chatroom = useSelector((state: RootState) => state.ChatReducer);
  const [isRecording, SetisRecording] = useState(false);
  const [blobURL, setblobURL] = useState('');
  const [isBlocked, setisBlocked] = useState(false);

  useEffect(() => {
    // on mount we want the permission from the user for the recording
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log('Permission Granted');
        setisBlocked(false);
      },
      () => {
        console.log('PermissionDenied');
        setisBlocked(true);
      }
    );
  }, []);
  const start = () => {
    if (isBlocked) {
      console.log('Permission Denied');
    } else {
      console.log('recording');
      Mp3Recorder.start()
        .then(() => {
          SetisRecording(true);
        })
        .catch((error: string) => console.error(error));
    }
  };
  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(async ([buffer, blob]: [Buffer, Blob]) => {
        // upload the mp3 to cloudinary and retrieve the url
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', 'PolyglotAudio');
        let POST_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/auto/upload`;
        const response = await fetch(`${POST_URL}`, {
          method: 'POST',
          body: formData,
        });
        const audio = await response.json();
        const audioFileLink = audio.url;
        // update the audio link
        setblobURL(audioFileLink);
        const newId = uuidv4();
        const newTimestamp = Date.now();
        const message = {
          AI_id: chatroom.chatroomId,
          AI_image: chatroom.AI_image,
          AI_name: chatroom.AI_name,
          userIds: chatroom.userIds,
          nativeLanguage: chatroom.nativeLanguage,
          chatroomId: chatroom.chatroomId,
          users: chatroom.users,
          targetLanguage: chatroom.targetLanguage,
          messages: {
            messageId: newId,
            senderId: user._id,
            senderName: user.name,
            timeStamp: newTimestamp,
            text: '',
            audio: audioFileLink,
            translatedText: '',
          },
        };
        // update the message on the front end
        dispatch({ type: 'updateVoiceMessage', payload: message.messages });
        const updatedChat = {
          ...chatroom,
          messages: [...chatroom.messages, message.messages],
        };

        SetisRecording(false);

        // sending data to the backend to extract text
        const info = {
          audio: audioFileLink,
        };
        const text = await sendingRecord(info);
        dispatch({ type: 'istyping', payload: true });
        // save to the database
        message.messages.text = text;
        await saveMessage(message);

        // make a response call to ChatGPT
        const ChatroomWithAIresponse = await AIresponse(updatedChat);

        // convert the text to audio through google cloud
        const updatedChatMessages = await getVoiceResponse(
          ChatroomWithAIresponse
        );
        dispatch({ type: 'istyping', payload: false });
        dispatch({ type: 'updatemessages', payload: updatedChatMessages });
      })
      .catch((error: string) => console.log(error));
  };

  return (
    <>
      {isRecording ? (
        <FontAwesomeIcon
          data-testid='stop_recording'
          className='stop_recording'
          icon={faCircleStop}
          onClick={stop}
          style={{ color: '#CCD6F6' }}
        />
      ) : (
        <FontAwesomeIcon
          data-testid='start_recording'
          className='start_recording'
          icon={faMicrophoneLines}
          onClick={start}
          style={{ color: '#CCD6F6' }}
        />
      )}
    </>
  );
}
