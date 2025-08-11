import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from '../components/shared/Loading';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { currentUser, isCurrentUserAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <Loading text="Checking permissions..." />;
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        // Check if user is logged in
        if (!currentUser) {
          return (
            <Redirect
              to={{
                pathname: '/signup',
                state: { from: props.location, message: 'Please login to continue' }
              }}
            />
          );
        }

        // Check if user is admin
        if (!isCurrentUserAdmin) {
          return (
            <Redirect
              to={{
                pathname: '/',
                state: { 
                  from: props.location, 
                  message: 'You do not have permission to access this page' 
                }
              }}
            />
          );
        }

        // User is admin, render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default AdminRoute;