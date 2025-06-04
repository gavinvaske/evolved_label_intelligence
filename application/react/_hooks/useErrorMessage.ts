import { AxiosError } from "axios";
import flashMessageStore from "../stores/flashMessageStore";

interface ErrorResponse {
  error?: string;
  errors?: string[];
}

const handleAxiosError = (error: AxiosError) => {
  const errorData = error.response?.data as ErrorResponse;

  console.log('handling axios error: ', errorData);

  if (!errorData) {
    flashMessageStore.addErrorMessage('Uh oh, an error occurred');
    return;
  }

  if (errorData.errors) {
    errorData.errors.forEach(error => {
      flashMessageStore.addErrorMessage(error);
    });
    return;
  }

  flashMessageStore.addErrorMessage(errorData.error || 'An error occurred');
};

const handleGenericError = (error: Error) => {
  flashMessageStore.addErrorMessage(error.message);
};

export const useErrorMessage = (error: AxiosError | Error) => {
  console.log('useErrorMessage: ', error);
  if (error instanceof AxiosError) {
    handleAxiosError(error);
  } else if (error instanceof Error) {
    handleGenericError(error);
  } else {
    console.error('Unexpected error: ', error);
    flashMessageStore.addErrorMessage('An unexpected error occurred, please try again');
  }
};