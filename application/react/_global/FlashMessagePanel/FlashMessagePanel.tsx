import { useEffect, useState } from 'react';
import flashMessageStore from '../../stores/flashMessageStore';
import { FlashMessageOption } from "@ui/types/flashMessage";
import { observer } from 'mobx-react-lite';
import * as styles from './FlashMessagePanel.module.scss'
import clsx from 'clsx';
import { TfiClose } from 'react-icons/tfi';
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";


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
        <div className={styles.flashMessageContainer}>
          {flashMessages.map((flashMessage) => <FlashMessage flashMessage={flashMessage} key={flashMessage.uuid} />)}
          {shouldRenderClearAllFlashMessagesButton &&
            <button className={styles.clearAllBtn} onClick={() => flashMessageStore.clearAllMessages()}>Clear All Messages</button>
          }
        </div>
      }
    </>
  )
})

const FlashMessage = (props: FlashMessageProps) => {
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
        <div className={clsx(styles.flashMessage, styles.flashMessage, type === 'SUCCESS' ? styles.successFlashMessage : styles.errorFlashMessage)}>
          <div className={styles.flashContainer}>
            <div className={styles.circleContainer}>
              <div className={styles.circleBackground}>
                {type === 'ERROR' && (<BiErrorCircle className={styles.errorIcon} />)}
                {type === 'SUCCESS' && (<IoCheckmarkCircleOutline className={styles.successIcon} />)}
              </div>
            </div>
            <div className={styles.flashContent}>

              {type === 'ERROR' && (<h6>Error</h6>)}
              {type === 'SUCCESS' && (<h6>Success</h6>)}

              <p>{message}</p>
            </div>
          </div>

          <TfiClose className={styles.closeMessageButton} onClick={() => flashMessageStore.removeFlashMessage(uuid)} />
          <div className={styles.bottomBumper}></div>
        </div>
      )}
    </>
  )
}

