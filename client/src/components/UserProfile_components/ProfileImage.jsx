import { useEffect, useState } from 'react';
import { getOPGGData } from '../../services/users.services';
import styled from '@emotion/styled';

export default function ProfileImage({ summonerName, region }) {
  const [image, setImage] = useState('');
  const [border, setBorder] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      const opggData = await getOPGGData(summonerName, region);

      console.log({ opggData });
      setImage(opggData?.profile_image_url || '');
      setBorder(opggData?.solo_tier_info?.border_image_url || '');
    };

    fetchImage();
  }, [summonerName, region]);

  if (!image) {
    return <></>;
  }

  return (
    <Face className="profile-image__face">
      <ProfileIconContainer className="profile-image__container">
        <BorderImage className="profile-image__border" borderImage={border} />
        <ProfileIcon
          className="profile-image__icon"
          src={image}
          alt={`${summonerName} summoner icon`}
        />
      </ProfileIconContainer>
    </Face>
  );
}

const Face = styled.div`
  display: inline-block;
  width: 100px;
  /* padding-left: 30px; */
  vertical-align: top;
  margin-left: 10px;
`;

const ProfileIconContainer = styled.div`
  position: relative;
`;

const BorderImage = styled.div`
  position: absolute;
  left: -10px;
  top: -10px;
  width: 120px;
  height: 120px;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-image: ${({ borderImage }) => `url(${borderImage})`};
`;

const ProfileIcon = styled.img`
  display: block;
  width: 100px;
  height: 100px;
  border: 0px;
  vertical-align: middle;
  max-width: 100%;
`;
