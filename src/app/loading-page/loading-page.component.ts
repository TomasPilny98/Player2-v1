import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {PlayerRestController} from "../rest/player-rest-controller";

import {VideoDto} from "../video/model";
import {NgToastService} from "ng-angular-popup";

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
              private toastMsg: NgToastService) {
  }

  ngOnInit(): void {
    this.getCamerasList()
  }

  getCamerasList(): void {
    this.playerRestController.onGetAllDevicesId().subscribe(deviceIdArray => {
      this.camerasList = deviceIdArray;
    })
  }

  onDateSelectChange(value: any, startDate: boolean) {
    if (startDate)
      this.startDate = value
    else
      this.endDate = value
    console.log("start: ", this.startDate)
    console.log("end: ", this.endDate)
  }

  onClearButtonClicked() {
    if (this.videoDtoArray.length == 0)
      this.toastMsg.info({detail: "Page does not have any records loaded", duration: 5000});
    else
      this.videoDtoArray.splice(0)
  }

  onSearchButtonClicked(): void {
    if ((this.startDate == null && this.endDate == null && this.selectedCamerasForm.value == '') ||
      (this.startDate == null && this.endDate != null) || (this.startDate != null && this.endDate == null)){
      this.toastMsg.error({
        detail: "No values selected",
        summary: "Choose date or select camera",
        duration: 5000 });
    }
    else {

    }
  }

  getAllRecordings() {
    this.playerRestController.onGetAllVideosMetadata().subscribe(metadata => {
      console.log(metadata)
      this.videoDtoArray = metadata
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
