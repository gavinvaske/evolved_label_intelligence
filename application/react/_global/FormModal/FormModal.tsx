import './FormModal.scss'
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'

export const FormModal = (props) => {
  const {
    Form,
    onCancel,
    onSubmit,
    ...additionalProps
  } = props;

  return (
    <div className='modal-wrapper'>
      <div className={clsx('modal', sharedStyles.card)}>
      <button className='close-button' type="button" onClick={() => onCancel()}><i className="fa-solid fa-x"></i></button>
        <div className='modal-content'>
          <Form
            onSubmit={onSubmit}
            onCancel={onCancel}
            {...additionalProps}
          />
        </div>
      </div>
    </div>
  )
}
