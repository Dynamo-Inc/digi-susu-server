import { AuthRoute } from './auth.route';
import { GroupRoute } from './groups.route';
import { UserRoute } from './users.route';

const AppRoutes = [new AuthRoute(), new UserRoute(), new GroupRoute()];

export default AppRoutes;
