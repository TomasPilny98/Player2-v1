import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {PlayerRestController} from "../rest/player-rest-controller";

import {VideoDto} from "../video/model";

@Component({
  selector: 'app-loading-page',
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.scss']
})
export class LoadingPageComponent implements OnInit {

  videoDtoArray: Array<VideoDto> = new Array<VideoDto>();
  cameras: FormControl = new FormControl('');
  camerasList: string[] = [];
  selectedCameras: string[] = [];
  startDate: string | null = null;
  endDate: string | null = null;

  constructor(private playerRestController: PlayerRestController) {
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
    this.videoDtoArray.splice(0)
  }

  onSearchButtonClicked(): void {
    /*this.playerRestController.onFilterVideosByDateAndIds(
      this.startDate,
      this.endDate,
      this.selectedCameras).subscribe(metadataDtoArray => {
      this.videoDtoArray = metadataDtoArray
    })*/

    // this is here for  testing purpose only
    this.playerRestController.onGetAllVideosMetadata().subscribe(metadata => {
      this.videoDtoArray = metadata
      console.log(metadata)
    })
  }
}
