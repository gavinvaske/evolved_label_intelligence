import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (_: Request, response: Response) => {
  response.redirect('react-ui/profile');
});

export default router;