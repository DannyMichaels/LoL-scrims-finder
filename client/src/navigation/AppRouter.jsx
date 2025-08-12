import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// screens
import SignUp from '@/features/auth/screens/SignUp';
import Scrims from '@/features/scrims/screens/Scrims';
import ScrimCreate from '@/features/scrims/screens/ScrimCreate';
import ScrimDetail from '@/features/scrims/screens/ScrimDetail';
import NotFound from '@/screens/NotFound';
import ScrimEdit from '@/features/scrims/screens/ScrimEdit';
import Settings from '@/screens/Settings';
import UserProfile from '@/features/users/screens/UserProfile';
import ServerError from '@/screens/ServerError';
import Guide from '@/screens/Guide';
import PrivacyPolicy from '@/screens/PrivacyPolicy';
import TermsOfService from '@/screens/TermsOfService';
import BanHistory from '@/features/admin/screens/BanHistory';
import AdminDashboard from '@/features/admin/screens/AdminDashboard';

const AppRouter = () => (
  <Switch>
    <AdminRoute exact path="/admin/dashboard" component={AdminDashboard} />
    <AdminRoute exact path="/scrims/new" component={ScrimCreate} />
    <AdminRoute exact path="/scrims/:id/edit" component={ScrimEdit} />
    <AdminRoute exact path={['/admin/bans', '/ban-history']} component={BanHistory} />
    <PrivateRoute exact path="/scrims/:id" component={ScrimDetail} />
    <PrivateRoute exact path="/settings" component={Settings} />
    <PrivateRoute exact path="/users/:name" component={UserProfile} />
    <Route exact path="/signup" component={SignUp} />
    <Route exact path="/server-error" component={ServerError} />
    <PrivateRoute exact path={['/', '/scrims']} component={Scrims} />
    <Route exact path="/guide" component={Guide} />
    
    {/* Legal Pages */}
    <Route exact path="/privacy-policy" component={PrivacyPolicy} />
    <Route exact path="/terms-of-service" component={TermsOfService} />

    <Route component={NotFound} />
  </Switch>
);

export default AppRouter;
