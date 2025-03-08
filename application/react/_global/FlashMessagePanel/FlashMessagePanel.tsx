import React, { useEffect, useState } from 'react';
import './FlashMessagePanel.scss';
import flashMessageStore from '../../stores/flashMessageStore';
import { FlashMessageOption } from "@ui/types/flashMessage";
import { observer } from 'mobx-react-lite';

type FlashMessageProps = {
  flashMessage: FlashMessageOption
}

export const FlashMessagePanel = observer(() => {
  const flashMessages = flashMessageStore.getFlashMessages();
  const shouldRenderFlashMessagePanel = flashMessages.length > 0
  const shouldRenderClearAllFlashMessagesButton = flashMessages.length > 1;

  return (
    <>
    {shouldRenderFlashMessagePanel &&
      <div className='flash-message-container'>
        {flashMessages.map((flashMessage) => <FlashMessage flashMessage={flashMessage} key={flashMessage.uuid}/>)}
        {shouldRenderClearAllFlashMessagesButton &&
          <button className='clear-all-btn' onClick={() => flashMessageStore.clearAllMessages()}>Clear All Messages</button>
        }
      </div>
    }
    </>
  )
})

const FlashMessage = (props : FlashMessageProps) => {
  const { flashMessage } = props;
  const { message, uuid, type } = flashMessage;
  const [shouldSuccessMessageBeRendered, setShouldSuccessMessageBeRendered] = useState(true);

  useEffect(() => {
    const fiveSecondsInMs = 5000;
    setTimeout(() => {
      setShouldSuccessMessageBeRendered(false)  // Success messages are hidden after x-seconds
    }, fiveSecondsInMs)
  }, [])

  const shouldRender = (type === 'SUCCESS' && shouldSuccessMessageBeRendered) || (type === 'ERROR')

  return (
    <>
      {shouldRender && (
        <div className={`flash-message ${type === 'SUCCESS' ? 'success-flash-message' : 'error-flash-message'}`}>
          <div className='flash-container'>
            <div className='circle-container'>
              <div className='circle-background'>
                {type === 'ERROR' && (<i className="fa-solid fa-xmark-large"></i>) } 
                {type === 'SUCCESS' && (<i className="fa-duotone fa-check"></i>) } 
              </div>
            </div>
            <div className='flash-content'>

              {type === 'ERROR' && (<h6>Error</h6>) } 
              {type === 'SUCCESS' && (<h6>Success</h6>) } 
              
              <p>{message}</p>
            </div>
          </div>
          
          <i className='fa-regular fa-close' onClick={() => flashMessageStore.removeFlashMessage(uuid)}></i>
          <div className='bottom-bumper'></div>
        </div>
      )}
    </>
  )
}

