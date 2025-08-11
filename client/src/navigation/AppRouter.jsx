import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// screens
import SignUp from '../screens/SignUp';
import Scrims from '../screens/Scrims';
import ScrimCreate from '../screens/admin_screens/ScrimCreate';
import ScrimDetail from '../screens/ScrimDetail';
import NotFound from '../screens/NotFound';
import ScrimEdit from '../screens/admin_screens/ScrimEdit';
import Settings from '../screens/Settings';
import UserProfile from '../screens/UserProfile';
import ServerError from '../screens/ServerError';
import Guide from '../screens/Guide';
import BanHistory from '../screens/admin_screens/BanHistory';
import AdminDashboard from '../screens/admin_screens/AdminDashboard';

const AppRouter = () => (
  <Switch>
    <AdminRoute exact path="/admin/dashboard" component={AdminDashboard} />
    <AdminRoute exact path="/scrims/new" component={ScrimCreate} />
    <AdminRoute exact path="/scrims/:id/edit" component={ScrimEdit} />
    <AdminRoute exact path={['/bans', '/ban-history']} component={BanHistory} />
    <PrivateRoute exact path="/scrims/:id" component={ScrimDetail} />
    <PrivateRoute exact path="/settings" component={Settings} />
    <PrivateRoute exact path="/users/:name" component={UserProfile} />
    <Route exact path="/signup" component={SignUp} />
    <Route exact path="/server-error" component={ServerError} />
    <PrivateRoute exact path={['/', '/scrims']} component={Scrims} />
    <Route exact path="/guide" component={Guide} />

    <Route component={NotFound} />
  </Switch>
);

export default AppRouter;
