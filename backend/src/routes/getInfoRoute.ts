/backend/src/controllers/logoutRoutes.ts
import { getUserInfo } from '@/controllers/getInfoController';
import { requireAuth } from '@/middlewares/requireAuth'; // 可選

export default requireAuth(getUserInfo);
