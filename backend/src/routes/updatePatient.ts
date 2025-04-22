import { updatePatient } from '@/controllers/updatePatientController';
import { requireAuth } from '@/middlewares/requireAuth';

export default requireAuth(updatePatient);
