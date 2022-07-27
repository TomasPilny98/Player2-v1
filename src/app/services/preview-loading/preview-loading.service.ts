import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PreviewLoadingService {

  private _dtoArrayContainer: BehaviorSubject<any>;

  constructor() {
    this._dtoArrayContainer = new BehaviorSubject<any>(null);
  }

  updateDtoArray(dtoArray: any){
    this._dtoArrayContainer.next(dtoArray);
  }

  get getDtoArray(): Observable<any> {
    return this._dtoArrayContainer.asObservable();
  }

}
