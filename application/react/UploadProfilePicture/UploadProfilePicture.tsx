import { useErrorMessage } from "../_hooks/useErrorMessage";
import axios from 'axios';
import './UploadProfilePicture.scss';
import { Image } from "../_global/Image/Image";
import { refreshLoggedInUser, useLoggedInUser } from "../_hooks/useLoggedInUser";
import { useQueryClient } from "@tanstack/react-query";

type MimeType = 'image/jpeg' | 'image/png' | 'image/jpg';

type Props = {
  apiEndpoint: string,
  acceptedMimeTypes: MimeType[] 
}

export const UploadProfilePicture = (props: Props) => {
  const { apiEndpoint, acceptedMimeTypes } = props;
  const { user, error } = useLoggedInUser()

  const profilePictureUrl = `data:image/${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`
  const queryClient = useQueryClient()

  if (error) {
    useErrorMessage(error);
  }

  const clearSelectedImage = () => {
    const fileInputField = document.getElementById('image-upload');

    if (!fileInputField) {
      useErrorMessage(new Error('No file input field found. Contact a developer to fix this issue.'));
      return
    }
  }

  const saveImage = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      useErrorMessage(new Error('No file selected. Refresh and try again.'));
      return;
    }

    let formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${apiEndpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      refreshLoggedInUser(queryClient);
    } catch (error) {
      clearSelectedImage();
      useErrorMessage(error)
    }
  }

  const allowedMimeTypes = acceptedMimeTypes.join(', ');

  return (
    <div className='profile-picture-container'>

      <div className='profile-picture-frame'>
        <Image img={profilePictureUrl} width={300}/>
        <div className="photo-details">
          <input
            id='image-upload'
            type="file"
            name="image"
            accept={allowedMimeTypes}
            onChange={(event) => saveImage(event)}
            title=" "
          />
        </div>
      </div>
    </div>
  );
};
