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
  actualIndex: number = 1
  frameShift: number = 1
  videoInterval: number | undefined;
  diagnosticFps: number = 10;
  diagnosticTimeout: number = 1000 / this.diagnosticFps;
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
    })
    this.setFrameShift()

    this.loadedFrames = new Array(this.videoDto.images_count)

    this.image.onload = function () {
      image_load()
    };

    const image_load = () => {
      this.ctx!.drawImage(this.image, 0, 0, 800, 600);
    }
  }

  ngAfterViewInit() {
    this.loadFramesByRange(0, this.frameShift)
    //this.loadFramesByRange(0, this.videoDto.images_count)
  }

  toggleDiagnosticMode(diagnosticOn: boolean, videoPreviewRef: any) {
    if (diagnosticOn) {
      this.ctx = this.diagnosticCanvas?.nativeElement.getContext('2d');
      videoPreviewRef.pause();  //pausing the [hidden] video
      this.image.src = this.framePrefix + this.loadedFrames[1]
      this.videoPlaying = false;
      this.backwardPlay = false;
    }
    this.diagnosticMode = !this.diagnosticMode;
  }

  setFrameShift(){
    this.frameShift = Math.floor(this.videoDto.frame_rate / this.diagnosticFps)
  }

  setCurrentTime(data: any) {
    this.currentTime = data.target.currentTime;
  }

  loadFramesByRange(firstFrame: number, lastFrame: number) {
    this.playerRestController.onGetFramesByRange(this.videoDto.id, firstFrame, lastFrame)
      .subscribe(received_images => {
        for (let frame of received_images){
          this.loadedFrames.push(frame);
        }
      })
  }

  getNumberOfLoadedFrames(){
    console.log('Loaded frames',this.loadedFrames.length - 1)
    this.image.src = this.framePrefix + this.loadedFrames[this.loadedFrames.length - 1]
  }

  loadFrameByIndex(index: number){
    this.playerRestController.onGetFrameByIndex(this.videoDto.id, index).subscribe(frame => {
      this.loadedFrames.push(frame)
    })
  }

  canLoadAnotherFrame(): boolean {
    return this.loadedFrames.length - 1 < this.videoDto.images_count
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
        if (this.backwardPlay){
          this.onPreviousFrame(true)
        }
        else {
          if (this.canLoadAnotherFrame()){
            console.log('upper requested value ',this.loadedFrames.length + this.frameShift + 1)
            this.loadFramesByRange(this.loadedFrames.length, this.loadedFrames.length + this.frameShift + 1)
          }
          this.onNextFrame(true)
        }
      }, this.diagnosticTimeout)
    } else {
      clearInterval(this.videoInterval)
    }
  }

  onNextFrameLimitReached(){
    console.log('[LIMIT REACHED] actual index ', this.actualIndex)
    if (this.actualIndex < this.loadedFrames.length - 1){
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
      if ((this.actualIndex + 1 ) <= this.loadedFrames.length){
        this.actualIndex += 1;
      }
      else{
        this.actualIndex = this.loadedFrames.length - 1;
        this.toastMsg.error({detail: "ERROR", summary: "You are exceeding maximum index", duration: 3000});
      }
    }
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

  onPreviousFrameLimitReached(){
    console.log(`%c actual index ${this.actualIndex}`, "color: red")
    if (this.actualIndex - 1 >= 1) {
      this.actualIndex -= 1;
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
    } else {
      this.actualIndex = 1
      this.toastMsg.error({detail: "ERROR", summary: "You are trying to access index lower than 0", duration: 3000});
    }
  }

  onNextFrame(autoPlay: boolean){
    if (this.actualIndex + this.frameShift > this.loadedFrames.length - 1) {
      this.onNextFrameLimitReached();
      return;
    }
    if (autoPlay){
      this.actualIndex += this.frameShift;
    } else {
      if (this.canLoadAnotherFrame()) this.loadFrameByIndex(this.loadedFrames.length + 1)
      this.actualIndex += 1;
    }
    console.log(`%c actual index ${this.actualIndex}`, "color: green")
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

  onPreviousFrame(autoPlay: boolean){
    if (this.actualIndex - this.frameShift < 0) {
      this.onPreviousFrameLimitReached();
      return;
    }
    if (autoPlay){
      this.actualIndex -= this.frameShift;
    } else {
      this.actualIndex -= 1
    }
    console.log(`%c actual index ${this.actualIndex}`, "color: red")
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

}
