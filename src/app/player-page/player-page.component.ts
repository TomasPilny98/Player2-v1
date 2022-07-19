import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
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
  videoDto: VideoDto | any;
  currentTime: number = 0;
  diagnosticMode: boolean = false;
  videoPlaying: boolean = false;
  backwardPlay: boolean = false;
  enumRef = ButtonMessagesEnum;
  image = new Image();
  loadedFrames: Array<string> = [];
  framePrefix: string = "data:image/png;base64,";
  actualIndex: number = 0
  frameShift: number = 1
  videoInterval: number | undefined;
  diagnosticFps: number = 1000 / 15;
  loadedVideo: any | undefined;
  private ctx: CanvasRenderingContext2D | undefined;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
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
        params['signal_request'],
        '')
      this.loadedFrames = new Array(this.videoDto.images_count)
    })

    this.image.onload = function () {
      image_load()
    };

    const image_load = () => {
      this.ctx!.drawImage(this.image, 0, 0, 800, 600);
    }
  }

  ngAfterViewInit() {
    this.getFramesByRange().then()
    //this.getVideoPreviewMp4().then()
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

  //TODO handle errors in case this call fails
  async getFramesByRange() {
    this.toastMsg.info({
      detail: "Loading video",
      summary: "video id: " + this.videoDto.id.toString(),
      duration: 3000
    })
    await this.playerRestController.onGetFramesByRange(this.videoDto.id, 0, this.videoDto.images_count - 1)
      .subscribe(received_images => {
        this.loadedFrames = received_images;
        this.toastMsg.success({
          detail: "Success",
          summary: "video id: " + this.videoDto.id.toString() + " successfully loaded",
          duration: 3000
        })
      })
  }

  async getVideoPreviewMp4() {
    console.log(this.videoDto.id, this.videoDto.device_id)
    await this.playerRestController.onGetPreviewMp4(this.videoDto.id, this.videoDto.device_id)
      .subscribe(videoFile => {
        this.loadedVideo = videoFile
      })
  }

  startStopButtonClicked() {
    this.videoPlaying = !this.videoPlaying;
    this.playVideo()
  }

  backwardButtonClicked() {
    this.backwardPlay = !this.backwardPlay;
  }

  playVideo(){
    if (this.videoPlaying){
      this.videoInterval = setInterval(() => {
        if (this.backwardPlay)
          this.onPreviousFrame()
        else
          this.onNextFrame()
      }, this.diagnosticFps)
    } else {
      clearInterval(this.videoInterval)
    }
  }

  onNextFrame(){
    if (this.actualIndex + this.frameShift > this.loadedFrames.length - 1) {
      this.actualIndex = this.loadedFrames.length
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex - 1]
      this.toastMsg.error({detail: "ERROR", summary: "You are exceeding maximum index", duration: 3000})
      return
    }
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex + this.frameShift];
    this.actualIndex += this.frameShift
  }

  onPreviousFrame(){
    if (this.actualIndex - this.frameShift < 0){
      this.actualIndex = 0
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex]
      this.toastMsg.error({detail: "ERROR", summary: "You are trying to access index lower than 0", duration: 3000})
      return
    }
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex - this.frameShift];
    this.actualIndex -= this.frameShift
  }

}
