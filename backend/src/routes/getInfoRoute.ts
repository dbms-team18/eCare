/backend/src/controllers/logoutRoutes.ts
import { getUserInfo } from '@/src/users/controllers/getInfo';
import { requireAuth } from '@/src/middlewares/requireAuth'; // 可選

export default requireAuth(getUserInfo);
