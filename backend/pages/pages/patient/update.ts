import { updatePatient } from '@/controllers/patient/updatePatientController';
import { requireAuth } from '@/middlewares/requireAuth';

export default requireAuth(updatePatient);