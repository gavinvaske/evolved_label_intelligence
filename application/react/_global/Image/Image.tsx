type Props = {
  img: string | File | null,
  width: number,
  alt?: string
}

export const Image = (props: Props) => {
  const { img, alt, width } = props;
  const placeholderImage = '';  /* If all else fails, this is put in the img src tag */
  const imageUrl = (typeof img ==='string') ? img : (img instanceof File) ? URL.createObjectURL(img) : placeholderImage;

  return (
    <img 
      src={imageUrl}
      alt={alt ? alt : 'Not Found'}
      width={`${width}px`} 
    />
  );
};