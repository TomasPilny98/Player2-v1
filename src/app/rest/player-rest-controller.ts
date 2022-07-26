import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class PlayerRestController {

  constructor(private http: HttpClient) {
  }

  onGetAllVideosMetadata() {
    return this.http.post<any>('http://127.0.0.1:5000/metadata/all', {})
  }

  onGetAllDevicesId() {
    return this.http.post<any>('http://127.0.0.1:5000/metadata/get-all-cameras-id', {})
  }

  onFilterVideosByDateAndIds(start: string | null, end: string | null, device_id_array: string[]) {
    return this.http.post<any>('http://127.0.0.1:5000/metadata/get-all-videos-by-date-and-ids',
      {start, end, device_id_array})
  }

  onGetVideosByDeviceId(device_id: string[]){
    return this.http.post<any>('http://127.0.0.1:5000/metadata/device-id', {device_id})
  }

  onGetVideosByDate(start: any, end: any){
    return this.http.post<any>('http://127.0.0.1:5000/metadata/date', {start, end})
  }

  onGetFrameByIndex(video_id: number, index: number) {
    return this.http.post<any>('http://127.0.0.1:5000/player/get-frame-by-index', {video_id, index})
  }

  onGetFrameByTime(video_id: string, time: string) {
    return this.http.post<any>('http://127.0.0.1:5000/player/get-frame-by-time', {video_id, time})
  }

  onGetFramesByInterval(video_id: string, start: any, end: any) {
    return this.http.post<any>('http://127.0.0.1:5000/player/get-frames-by-interval', {video_id, start, end})
  }

  onGetFramesByRange(video_id: string, first: number, last: number) {
    return this.http.post<any>('http://127.0.0.1:5000/player/get-frames-by-range', {video_id, first, last})
  }

  onGetPreviewMp4(video_id: number, device_id: string) {
    return this.http.post<any>('http://127.0.0.1:5000/player/get-mp4', {video_id, device_id})
  }

}
