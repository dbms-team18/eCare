
import { getUserInfo } from '@/controllers/user/getInfoController';
import { requireAuth } from '@/middlewares/requireAuth'; // 可選

export default requireAuth(getUserInfo);