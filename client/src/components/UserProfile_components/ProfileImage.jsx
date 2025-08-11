import styled from '@emotion/styled';
import CircularProgress from '@mui/material/CircularProgress';
import useSummonerProfile from '../../hooks/useSummonerProfile';

export default function ProfileImage({
  summonerName,
  summonerTagline,
  region,
}) {
  const { profileData, isLoading } = useSummonerProfile(
    summonerName,
    summonerTagline,
    region
  );

  if (isLoading) {
    return (
      <div style={{ marginRight: '20px' }}>
        <CircularProgress size={80} />
      </div>
    );
  }

  // Construct OP.GG URL with Riot ID if tagline is available
  const opggUrl = summonerTagline
    ? `https://www.op.gg/summoners/${region.toLowerCase()}/${encodeURIComponent(
        summonerName
      )}-${encodeURIComponent(summonerTagline)}`
    : `https://${region}.op.gg/summoner/userName=${summonerName}`;

  return (
    <Face
      className="profile-image__face"
      href={opggUrl}
      target="_blank"
      rel="noopener noreferrer">
      <ProfileIconContainer className="profile-image__container">
        <ProfileIcon
          className="profile-image__icon"
          src={profileData.profileIcon}
          alt={`${summonerName} summoner icon`}
        />

        <Level>{profileData.level}</Level>
      </ProfileIconContainer>
    </Face>
  );
}

const Face = styled.a`
  display: inline-block;
  width: 100px;
  vertical-align: top;
  margin-left: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  cursor: pointer;
`;

const ProfileIconContainer = styled.div`
  position: relative;
`;

const ProfileIcon = styled.img`
  display: block;
  width: 100px;
  height: 100px;
  border: 0px;
  border-radius: 20px;
  vertical-align: middle;
  max-width: 100%;
`;

const Level = styled.span`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: -14px;
  margin-left: -22px;
  width: 44px;
  height: 24px;
  padding-top: 3px;
  box-sizing: border-box;
  line-height: 17px;
  font-family: Helvetica, AppleSDGothic, 'Apple SD Gothic Neo', AppleGothic,
    Arial, Tahoma;
  font-size: 14px;
  text-align: center;
  color: rgb(234, 189, 86);
  background: url(https://s-lol-web.op.gg/static/images/site/summoner/bg-levelbox.png)
    0% 0% / 100%;
`;
