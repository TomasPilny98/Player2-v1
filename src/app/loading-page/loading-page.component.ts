import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {PlayerRestController} from "../rest/player-rest-controller";

import {VideoDto} from "../video/model";
import {NgToastService} from "ng-angular-popup";
import {PreviewLoadingService} from "../services/preview-loading/preview-loading.service";

@Component({
  selector: 'app-loading-page',
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.scss']
})
export class LoadingPageComponent implements OnInit {

  videoDtoArray: Array<VideoDto> = new Array<VideoDto>();
  selectedCamerasForm: FormControl = new FormControl('');
  camerasList: string[] = [];
  startDate: string | null = null;
  endDate: string | null = null;

  constructor(private playerRestController: PlayerRestController,
              private toastMsg: NgToastService,
              private videoPreviewService: PreviewLoadingService) {
  }

  ngOnInit(): void {
    this.getCamerasList()
  }

  getCamerasList(): void {
    this.playerRestController.onGetAllDevicesId().subscribe(deviceIdArray => {
      this.camerasList = deviceIdArray;
    })
  }


  onClearButtonClicked() {
    if (this.videoDtoArray.length == 0)
      this.toastMsg.info({detail: "Page does not have any records loaded", duration: 5000});
    else {
      this.videoDtoArray.splice(0)
      this.startDate = null;
      this.endDate = null;
      this.selectedCamerasForm.reset();
    }
  }

  onSearchButtonClicked(): void {
    if ((this.startDate == null && this.endDate == null && this.selectedCamerasForm.value == '') ||
      (this.startDate == null && this.endDate != null) || (this.startDate != null && this.endDate == null)) {
      this.toastMsg.error({
        detail: "No values selected",
        summary: "Choose date or select camera",
        duration: 5000
      });
    } else {
      this.playerRestController.onGetVideosByDeviceId(this.selectedCamerasForm.value).subscribe(videosMetadata => {
        if (videosMetadata.length > 0) {
          for (let outerIndex = 0; outerIndex < videosMetadata.length; outerIndex++) {
            for (let innerIndex = 0; innerIndex < videosMetadata[outerIndex].length; innerIndex++) {
              if (this.videoDtoArray.filter(e => e.id == videosMetadata[outerIndex][innerIndex]['id']).length == 0)
                this.videoDtoArray.push(videosMetadata[outerIndex][innerIndex]);
            }
          }
        }
      })
      this.playerRestController.onGetVideosByDate(this.startDate, this.endDate).subscribe(videosMetadata => {
        for (let i = 0; i < videosMetadata.length; i++) {
          if (this.videoDtoArray.filter(e => e.id == videosMetadata[i]['id']).length == 0)
            this.videoDtoArray.push(videosMetadata[i])
        }
      })
      this.videoPreviewService.updateDtoArray(this.videoDtoArray);
    }
  }

  getAllRecordings() {
    this.playerRestController.onGetAllVideosMetadata().subscribe(metadata => {
      console.log(metadata)
      this.videoDtoArray = metadata
      this.videoPreviewService.updateDtoArray(this.videoDtoArray);
      if (this.videoDtoArray == null)
        this.toastMsg.warning({
          detail: "WARNING",
          summary: "Server does not contain any video records",
          duration: 5000
        });

    })
  }

}

//TODO sort by, show only (from already loaded videos)
