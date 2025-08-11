import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useUsers from '@/features/users/hooks/useUsers';
import { Link, useLocation } from 'react-router-dom';

// utils
import styled from '@emotion/styled';
import { levenshteinDistance } from '@/utils/levenshteinDistance';
import { getRankImage } from '@/utils/getRankImage';

// components
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';

// icons
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export default function UserSearchBar({ isSearchOpen }) {
  const [showOptions, setShowOptions] = useState(false);
  const { allUsers, usersSearchValue } = useUsers();
  const [userInput, setUserInput] = useState(() => usersSearchValue);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((user) => {
        if (!userInput) return false;

        // Check if input contains # for Riot ID search
        if (userInput.includes('#')) {
          const [searchName, searchTagline] = userInput.split('#');
          const nameMatch = user.name
            .toLowerCase()
            .includes(searchName.toLowerCase());
          const taglineMatch = searchTagline
            ? user.summonerTagline
                ?.toLowerCase()
                .includes(searchTagline.toLowerCase())
            : true;
          return nameMatch && taglineMatch;
        }

        // Otherwise search by name or tagline separately
        const nameMatch = user.name
          .toLowerCase()
          .includes(userInput.toLowerCase());
        const taglineMatch = user.summonerTagline
          ?.toLowerCase()
          .includes(userInput.toLowerCase());
        return nameMatch || taglineMatch;
      })
      .sort((a, b) => {
        // sort by levenshteinDistance
        const searchString = userInput.includes('#')
          ? userInput.split('#')[0]
          : userInput;
        const levA = levenshteinDistance(a.name, searchString);
        const levB = levenshteinDistance(b.name, searchString);

        return levA - levB;
      });
  }, [allUsers, userInput]);

  const handleChange = (e) => {
    const newUserInput = e.target.value;
    setUserInput(newUserInput);
    setShowOptions(true);
  };

  const handleReset = () => {
    setUserInput('');
    setShowOptions(false);
  };

  const handleClickOption = () => {
    setUserInput('');
    setShowOptions(false);
  };

  useEffect(() => {
    dispatch({ type: 'users/setSearch', payload: userInput });

    return () => {
      dispatch({ type: 'users/setSearch', payload: '' });
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput]);

  useEffect(() => {
    if (usersSearchValue === '') {
      setShowOptions(false);
      setUserInput('');
    }
  }, [usersSearchValue]);

  useEffect(() => {
    dispatch({ type: 'users/setSearch', payload: '' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  //  renders dropdown or no options text
  const autoCompleteJSX = useMemo(() => {
    if (!isSearchOpen) return null;
    // if the user typed
    if (userInput && showOptions) {
      // if the user typed and we have filtered options, that means we should show the options
      if (filteredUsers.length) {
        return (
          <Dropdown
            className={`nav__dropdown${isSearchOpen ? ' visible' : ''}`}>
            <ul className="nav__dropdown-items">
              {filteredUsers.slice(0, 8).map((user) => {
                const rankImage = getRankImage(user);

                // Handle highlighting for both name and tagline
                let displayName = user.name;
                let displayTagline = user.summonerTagline
                  ? `#${user.summonerTagline}`
                  : '';

                if (userInput.includes('#')) {
                  const [searchName, searchTagline] = userInput.split('#');
                  const nameRegex = new RegExp('(' + searchName + ')', 'i');
                  displayName = user.name.replace(nameRegex, '<b>$1</b>');
                  if (searchTagline && user.summonerTagline) {
                    const taglineRegex = new RegExp(
                      '(' + searchTagline + ')',
                      'i'
                    );
                    displayTagline =
                      '#' +
                      user.summonerTagline.replace(taglineRegex, '<b>$1</b>');
                  }
                } else {
                  const regex = new RegExp('(' + userInput + ')', 'i');
                  displayName = user.name.replace(regex, '<b>$1</b>');
                  if (user.summonerTagline) {
                    displayTagline =
                      '#' + user.summonerTagline.replace(regex, '<b>$1</b>');
                  }
                }

                // Build the profile URL with tagline if available
                const profileUrl = user.summonerTagline
                  ? `/users/${user.name}?region=${user.region}&tagline=${user.summonerTagline}`
                  : `/users/${user.name}?region=${user.region}`;

                return (
                  <Link
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={handleClickOption}
                    to={profileUrl}
                    className="nav__autocomplete-option"
                    key={user._id}>
                    <img
                      src={rankImage}
                      style={{ marginRight: '5px' }}
                      width="20px"
                      alt={user.rank}
                    />
                    <span className="truncate">
                      <span dangerouslySetInnerHTML={{ __html: displayName }} />
                      <span
                        style={{ color: '#999', fontSize: '0.9em' }}
                        dangerouslySetInnerHTML={{ __html: displayTagline }}
                      />
                    </span>
                    <span
                      style={{
                        marginLeft: '5px',
                        color: '#666',
                        fontSize: '0.9em',
                      }}>
                      ({user.region})
                    </span>
                  </Link>
                );
              })}
            </ul>
          </Dropdown>
        );
      } else {
        // else if the user typed and we have no options
        return (
          <div className="nav__no-option">
            <em>No Option!</em>
          </div>
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsers, userInput, showOptions]);

  return (
    <>
      <Search className="nav__search-container">
        <Input
          fullWidth
          type="text"
          className="nav__search-input"
          onChange={handleChange}
          value={userInput || ''}
          placeholder="Search users"
          endAdornment={
            <InputAdornment position="end">
              {userInput ? (
                <IconButton onClick={handleReset}>
                  <CloseIcon fontSize="medium" />
                </IconButton>
              ) : (
                <SearchIcon fontSize="medium" />
              )}
            </InputAdornment>
          }
        />
        {autoCompleteJSX}
      </Search>
    </>
  );
}

const Dropdown = styled(Card)`
  position: absolute;
  min-width: 250px;
  top: 38px;
  z-index: 5;
  background: #fff;
  box-shadow: -3px 5px 17px 1px #000;
  display: none;

  &.visible {
    display: block;
  }

  .truncate {
    display: block;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Search = styled.div`
  position: relative;
  z-index: 4;

  .nav__search-input {
    color: #fff;
  }

  .nav__dropdown-items {
    display: flex;
    flex-direction: column;
    align-items: start;
    list-style-type: none;
    padding-left: 0;
    margin-left: 0;
  }

  .nav__autocomplete-option {
    margin-left: auto;
    margin-right: auto;
    cursor: pointer;

    border-radius: 5px;
    padding: 10px;
    transition: all 250ms ease-in-out;

    text-decoration: none;

    color: #000;
    width: 95%;

    &:hover {
      background: #cccc;
    }
  }

  .nav__no-option {
    position: absolute;
    top: 38px;
  }
`;
