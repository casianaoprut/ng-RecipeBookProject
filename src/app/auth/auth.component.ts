import {
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';

import {AuthService} from './auth.service';
import {AuthResponseData} from './auth-response-data.model';

import {AlertComponent} from '../shared/alert/alert.component';
import {PlaceholderDirective} from '../shared/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLogInMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;
  private closeSub: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  onSwitchMode(): void {
    this.isLogInMode = !this.isLogInMode;
  }

  onSubmit(form: NgForm): void {
    console.log('Login: ' + this.isLogInMode);
    if (!form.valid){
      return;
    }
    let authObs: Observable<AuthResponseData>;
    const email = form.value.email;
    const password = form.value.password;

    authObs = this.isLogInMode ? this.authService.logIn(email, password) : this.authService.signUp(email, password);

    this.isLoading = true;
    authObs.subscribe(() => {
      this.isLoading = false;
      this.router.navigate(['/recipes']).then(() => {});
    }, errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;
      this.showErrorAlert(errorMessage); // // Dynamic component loader
      this.isLoading = false;
    });
    form.reset();
  }

  onHandelError(): void {
    this.error = null;
  }

  private showErrorAlert(message: string): void { // Dynamic component loader
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const viewContainerRef = this.alertHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(alertCmpFactory);
    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      viewContainerRef.clear();
    });
  }
}
