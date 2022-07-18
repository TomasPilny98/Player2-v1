import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {VideoDto} from "../video/model";
import {NgToastService} from "ng-angular-popup";
import {ButtonMessagesEnum} from "./button-messages-enum";
import {PlayerRestController} from "../rest/player-rest-controller";


@Component({
  selector: 'app-player-page',
  templateUrl: './player-page.component.html',
  styleUrls: ['./player-page.component.scss']
})
export class PlayerPageComponent implements OnInit, AfterViewInit {
  @ViewChild('diagnosticCanvas', {static: false}) diagnosticCanvas: ElementRef | undefined;
  private ctx: CanvasRenderingContext2D | undefined;
  videoDto: VideoDto | any;
  currentTime: number = 0;
  diagnosticMode: boolean = false;
  videoPlaying: boolean = false;
  backwardPlay: boolean = false;
  enumRef = ButtonMessagesEnum
  image = new Image()
  images: Array<string> = []

  //images_count - 1

  constructor(private activatedRoute: ActivatedRoute,
              private toastMsg: NgToastService,
              private playerRestController: PlayerRestController) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.videoDto = new VideoDto(
        params['id'],
        params['device_id'],
        params['record_mode'],
        params['timestamp'],
        params['frame_rate'],
        params['images_count'],
        params['origin'],
        params['trigger_timestamp'],
        params['signal_request'])
      this.images = new Array(this.videoDto.images_count)
    })
  }

  ngAfterViewInit() {
    this.getFramesByRange().then()
  }

  toggleDiagnosticMode(diagnosticOn: boolean, videoPreviewRef: any) {
    if (diagnosticOn) {
      this.ctx = this.diagnosticCanvas?.nativeElement.getContext('2d');
      videoPreviewRef.pause();  //pausing the [hidden] video
      this.videoPlaying = false;
      this.backwardPlay = false;
    }
    this.diagnosticMode = !this.diagnosticMode;
  }

  setCurrentTime(data: any) {
    this.currentTime = data.target.currentTime;
  }

  startStopButtonClicked() {
    this.videoPlaying = !this.videoPlaying;
    if (this.videoPlaying)
      this.onStartDrawImage();
    this.toastMsg.success({
      detail: "Success",
      summary: "video play state:" + this.videoPlaying.toString(),
      duration: 3000
    })
  }

  backwardButtonClicked() {
    this.backwardPlay = !this.backwardPlay;
    this.toastMsg.success({
      detail: "Success",
      summary: "video backward play:" + this.backwardPlay.toString(),
      duration: 3000
    })
  }

  async getFramesByRange() {
    this.toastMsg.info({
      detail: "Loading video",
      summary: "video id: " + this.videoDto.id.toString(),
      duration: 3000
    })
    await this.playerRestController.onGetFramesByRange(this.videoDto.id, 0, this.videoDto.images_count - 1)
      .subscribe(received_images => {
        this.images = received_images;
        this.toastMsg.success({
          detail: "Success",
          summary: "video id: " + this.videoDto.id.toString() + " successfully loaded",
          duration: 3000
        })
      })
  }

  onStartDrawImage() {
    console.log('entering onStartDrawImage()')
    this.image.src = this.images[0]
    console.log(this.image.src)
    this.ctx!.drawImage(this.image, 0, 0);

  }

}
