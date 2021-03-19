import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {exhaustMap, map, take, tap} from 'rxjs/operators';

import {RecipeService} from '../recipes/recipe.service';
import {AuthService} from '../auth/auth/auth.service';

import {Recipe} from '../recipes/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private http: HttpClient,
              private recipeService: RecipeService,
              private authService: AuthService) {

  }

  storeRecipes(): void {
    const recipes = this.recipeService.getRecipes();
    this.http.put('https://ng-course-recipe-book-471cf-default-rtdb.firebaseio.com/recipes.json', recipes).subscribe();
  }

  fetchRecipes(): Observable<Recipe[]>{
    return this.http
      .get<Recipe[]>('https://ng-course-recipe-book-471cf-default-rtdb.firebaseio.com/recipes.json')
      .pipe(
        map ( recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => {
          this.recipeService.setRecipes(recipes);
        })
      );
  }
}
