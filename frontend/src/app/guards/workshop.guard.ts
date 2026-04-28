import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const workshopGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getCurrentUser();

  if (user?.role === 'workshop') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};