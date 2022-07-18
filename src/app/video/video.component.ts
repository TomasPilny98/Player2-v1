import {Component, Input, OnInit, Output} from '@angular/core';

import {VideoDto} from "./model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})

export class VideoComponent implements OnInit {
  @Input() videoDto: VideoDto | any;

  Id: number | any;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.Id = this.videoDto.videoId
  }

  onClickHandler() {
    this.router.navigate(['/player-page'], {
      queryParams: {
        id: this.videoDto.id,
        device_id: this.videoDto.device_id,
        timestamp: this.videoDto.timestamp,
        frame_rate: this.videoDto.frame_rate,
        images_count: this.videoDto.images_count,
        origin: this.videoDto.origin,
        trigger_timestamp: this.videoDto.trigger_timestamp,
        signal_request: this.videoDto.signal_request}
    })
  }

}
