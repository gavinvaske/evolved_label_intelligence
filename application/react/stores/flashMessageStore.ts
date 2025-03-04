import { makeAutoObservable } from 'mobx';
import { ErrorFlashMessage, SuccessFlashMessage, FlashMessageOption } from "@ui/types/flashMessage";
import { v4 as uuidv4 } from 'uuid';

class FlashMessageStore {
  errorMessages: ErrorFlashMessage[] = [];
  successMessage: SuccessFlashMessage | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  getFlashMessages() {
    const flashMessages: FlashMessageOption[] = [...this.errorMessages]

    if (this.successMessage) flashMessages.push(this.successMessage)

    return flashMessages
  }

  removeFlashMessage(uuidToRemove: string) : void {
    let errorIndexToRemove: number = this.errorMessages.findIndex(({ uuid }) => uuid === uuidToRemove);

    if (errorIndexToRemove >= 0) {
      this.errorMessages.splice(errorIndexToRemove, 1) // Removes 1 element from array
      return;
    }

    if (this.successMessage && this.successMessage.uuid === uuidToRemove) {
      this.clearSuccessMessage()
    }
  }

  addErrorMessage(message: string): void {
    const errorMessage: ErrorFlashMessage = {
      message: message || 'Uh, oh no! Something went wrong.',
      uuid: uuidv4(),
      type: 'ERROR'
    }

    this.errorMessages = [errorMessage, ...this.errorMessages];
  }

  addSuccessMessage(message: string): void {
    const successMessage: SuccessFlashMessage = {
      message,
      uuid: uuidv4(),
      type: 'SUCCESS'
    }

    this.clearAllMessages();
    
    this.successMessage = successMessage
  }

  clearErrorMessages(): void {
    this.errorMessages = []
  }

  clearSuccessMessage(): void {
    this.successMessage = null
  }

  clearAllMessages(): void {
    this.clearErrorMessages()
    this.clearSuccessMessage()
  } 
}

export default new FlashMessageStore();