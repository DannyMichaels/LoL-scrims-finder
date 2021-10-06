import { Redirect, Route } from 'react-router';
import { useSelector } from 'react-redux';

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useSelector(({ auth }) => auth);

  // const jwtToken = localStorage.jwtToken;

  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/signup" />
        );
      }}
    />
  );
}
