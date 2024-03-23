import { Injectable, ApplicationRef } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingBarService {
  private loadingShownCounter = 0;
  setBarVisible: () => void = () => null;
  setBarHidden: () => void = () => null;

  constructor(private appRef: ApplicationRef) {}

  public setShowProgressBarHandle(
    setVisible: () => void,
    setHidden: () => void
  ) {
    this.setBarVisible = setVisible;
    this.setBarHidden = setHidden;
  }

  public waitFor<T>(
    obs: Observable<T>,
    finishedCallback: (r: T) => void,
    errCallback?: (error: unknown) => void
  ) {
    this.loadingShownCounter += 1;
    this.setBarVisible();

    obs.subscribe({
      next: (val) => {
        finishedCallback(val);

        this.decreaseLoadingBarCounter();
      },
      error: (err) => {
        if (errCallback) {
          errCallback(err);
        }

        this.decreaseLoadingBarCounter();
      },
    });
  }

  private decreaseLoadingBarCounter() {
    this.loadingShownCounter -= 1;
    if (this.loadingShownCounter <= 0) this.setBarHidden();
  }
}
