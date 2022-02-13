import { useEffect, useState } from 'react';
import { getOPGGData } from '../../services/users.services';

export default function ProfileImage({ summonerName, region }) {
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      const opggData = await getOPGGData();

      setImage(opggData?.profile_image_url || '');
    };

    fetchImage();
  }, []);

  if (!image) {
    return <></>;
  }

  return <img src={image} alt={`${summonerName} summoner icon`} />;
}
