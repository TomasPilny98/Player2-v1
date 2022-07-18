import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[videoPreviewHost]'
})
export class VideoPreviewDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }

}
