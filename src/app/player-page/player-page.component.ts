import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {VideoDto} from "../video/model";
import {NgToastService} from "ng-angular-popup";
import {ButtonMessagesEnum} from "./button-messages-enum";
import {PlayerRestController} from "../rest/player-rest-controller";
import {Options} from '@angular-slider/ngx-slider';


@Component({
  selector: 'app-player-page',
  templateUrl: './player-page.component.html',
  styleUrls: ['./player-page.component.scss']
})
export class PlayerPageComponent implements OnInit {
  @ViewChild('diagnosticCanvas', {static: false}) diagnosticCanvas: ElementRef | undefined;
  videoDto: VideoDto | any;
  smallVideoCurrentTime: number = 0;
  diagnosticCurrentTime: number = 0;
  recSize: number | undefined;
  diagnosticMode: boolean = true;
  rotationDegree: number = 0
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
  loadedVideo: any | undefined = './assets/artificialPreviews/video5.mp4'
  private ctx: CanvasRenderingContext2D | undefined;
  downloadedFlag: boolean = false;
  videoLoopActive: boolean = false;

  optionsSingle: Options = {
    floor: 0,
    ceil: 10,
    step: 0.01,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + 's';
    }
  };

  minValue: number = 0;
  maxValue: number = 0;
  optionsDual: Options = {
    floor: 0,
    ceil: 10,
    step: 0.01,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + 's';
    },
    combineLabels: (minValue: string, maxValue: string): string => {
      return minValue + '  -  ' + maxValue;
    }
  };

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
        params['signal_request'],
        '')
    })
    this.recSize = this.videoDto.images_count / this.videoDto.frame_rate;
    this.optionsSingle.ceil = this.recSize;
    this.optionsDual.ceil = this.recSize;
    this.maxValue = (this.recSize / 2) + 10;
    this.minValue = (this.recSize / 2) - 10;
    this.setFrameShift()
    this.loadedFrames = new Array(this.videoDto.images_count)

    this.image.onload = function () {
      image_load()
    };

    const image_load = () => {
      this.ctx = this.diagnosticCanvas?.nativeElement.getContext('2d');
      let scaledSizes = this.calculateDownscale(this.image.width, this.image.height, 50);
      this.ctx!.canvas.width = scaledSizes[0];
      this.ctx!.canvas.height = scaledSizes[1];
      this.ctx!.drawImage(this.image, 0, 0, scaledSizes[0], scaledSizes[1]);
    }

    this.loadFirstFrame();
    this.loadFramesByRange(1, this.videoDto.images_count).then();
  }

  calculateDownscale(width: number, height: number, scalePercentage: number): number[] {
    let scaledWidth: number = width;
    let scaledHeight: number = height;
    if (width > 1000) {
      let pixel: number = (width * height * scalePercentage) / 100;
      let wRatio: number = height / width;
      let hRatio: number = width / height;
      scaledWidth = Math.sqrt(pixel / wRatio);
      scaledHeight = Math.sqrt(pixel / hRatio);
    }
    return [scaledWidth, scaledHeight]
  }

  videoLoopActivated(){
    this.startStopButtonClicked(true, false)
    let button = document.getElementById('loopButton');
    this.videoLoopActive = !this.videoLoopActive;
    if (this.videoLoopActive)
      button!.style.backgroundColor = 'lightgreen';
    else
      button!.style.backgroundColor = 'white';
  }

  updateTimeForTimeline() {
    this.diagnosticCurrentTime = (this.recSize! * this.actualIndex) / this.videoDto.images_count;
  }

  updateLastFrameForTimeline() {
    if (!this.videoLoopActive){
      this.startStopButtonClicked(true, false);
      this.actualIndex = Math.floor((this.diagnosticCurrentTime * this.videoDto.images_count) / this.recSize!)
      this.startStopButtonClicked(true, true);
    }
  }

  getMp4() {
    this.playerRestController.onGetPreviewMp4(this.videoDto.id, this.videoDto.device_id).subscribe(video => {
      this.loadedVideo = video;
    })
  }

  onRotateFrameClicked() {
    this.rotationDegree -= 90;
    let canvas = document.getElementById('diagnosticCanvas');
    canvas!.style.transform = 'rotate(' + this.rotationDegree + 'deg)';
  }

  toggleDiagnosticMode(diagnosticOn: boolean, videoPreviewRef: any) {
    if (diagnosticOn) {
      videoPreviewRef.pause();  //pausing the [hidden] video
      this.videoPlaying = false;
      this.backwardPlay = false;
    }
    this.diagnosticMode = !this.diagnosticMode;
  }

  setFrameShift() {
    this.frameShift = Math.floor(this.videoDto.frame_rate / this.diagnosticFps)
  }

  setCurrentTime(data: any) {
    this.smallVideoCurrentTime = data.target.currentTime;
  }

  async loadFramesByRange(firstFrame: number, lastFrame: number) {
    this.toastMsg.info({
      detail: "DOWNLOADING VIDEO FROM SERVER",
      summary: "Video " + this.videoDto.id.toString() + " is being downloaded",
      duration: 3000
    });
    await this.playerRestController.onGetFramesByRange(this.videoDto.id, firstFrame, lastFrame)
      .subscribe(received_images => {
        for (let frame of received_images) {
          this.loadedFrames.push(frame);
        }
        this.toastMsg.success({
          detail: "DOWNLOAD DONE",
          summary: "Video " + this.videoDto.id.toString() + " downloaded successfully",
          duration: 3000
        });
        this.downloadedFlag = true;
        this.image.src = this.framePrefix + this.loadedFrames[1];
      })
  }

  loadFrameByIndex(index: number) {
    this.playerRestController.onGetFrameByIndex(this.videoDto.id, index).subscribe(frame => {
      this.loadedFrames.push(frame)
    })
  }

  loadFirstFrame() {
    this.playerRestController.onGetFrameByIndex(this.videoDto.id, 0).subscribe(frame => {
      this.loadedFrames.push(frame)

    })
  }

  canLoadAnotherFrame(): boolean {
    return this.loadedFrames.length - 1 < this.videoDto.images_count
  }

  startStopButtonClicked(timeLineControl: boolean, videoPlaying: any = null) {
    if (timeLineControl) this.videoPlaying = videoPlaying;
    else this.videoPlaying = !this.videoPlaying;
    this.playVideo();
  }

  backwardButtonClicked() {
    this.backwardPlay = !this.backwardPlay;
  }

  playVideo() {
    if (this.videoPlaying) {
      this.videoInterval = setInterval(() => {
        if (this.backwardPlay) {
          this.onPreviousFrame(true)
        } else {
          if (this.canLoadAnotherFrame()) {
            console.log('upper requested value ', this.loadedFrames.length + this.frameShift + 1)
            this.loadFramesByRange(this.loadedFrames.length, this.loadedFrames.length + this.frameShift + 1).then();
          }
          this.onNextFrame(true)
          console.log(this.image.width, this.image.height)
        }
      }, this.diagnosticTimeout)
    } else {
      clearInterval(this.videoInterval)
    }
  }

  onNextFrameLimitReached() {
    console.log('[LIMIT REACHED] actual index ', this.actualIndex)
    if (this.actualIndex == this.videoDto.images_count) this.startStopButtonClicked(true, false);
    if (this.actualIndex < this.loadedFrames.length - 1) {
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
      if ((this.actualIndex + 1) < this.loadedFrames.length) {
        this.actualIndex += 1;
      } else {
        this.actualIndex = this.loadedFrames.length - 1;
      }
    }
    this.updateTimeForTimeline();
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

  onPreviousFrameLimitReached() {
    console.log(`%c actual index ${this.actualIndex}`, "color: red")
    if (this.actualIndex - 1 >= 1) {
      this.actualIndex -= 1;
      this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
    } else {
      this.actualIndex = 1
      this.startStopButtonClicked(true, false);
      this.backwardPlay = false;
    }
    this.updateTimeForTimeline();
  }

  onNextFrame(autoPlay: boolean) {
    if (this.actualIndex + this.frameShift > this.loadedFrames.length - 1) {
      this.onNextFrameLimitReached();
      return;
    }
    if (autoPlay) {
      this.actualIndex += this.frameShift;
    } else {
      if (this.canLoadAnotherFrame()) this.loadFrameByIndex(this.loadedFrames.length + 1)
      this.actualIndex += 1;
    }
    this.updateTimeForTimeline();
    console.log(`%c actual index ${this.actualIndex}`, "color: green")
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

  onPreviousFrame(autoPlay: boolean) {
    if (this.actualIndex - this.frameShift < 0) {
      this.onPreviousFrameLimitReached();
      return;
    }
    if (autoPlay) {
      this.actualIndex -= this.frameShift;
    } else {
      this.actualIndex -= 1
    }
    this.updateTimeForTimeline();
    console.log(`%c actual index ${this.actualIndex}`, "color: red")
    this.image.src = this.framePrefix + this.loadedFrames[this.actualIndex];
  }

}
