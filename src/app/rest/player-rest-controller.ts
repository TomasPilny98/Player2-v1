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

  onFilterVideosByDateAndIds(video_id: string, dateStart: string | null, dateEnd: string | null, deviceId: string[]) {
    return this.http.post<any>('http://127.0.0.1:5000/metadata/get-all-videos-by-date',
      {video_id, dateStart, dateEnd, deviceId})
  }

  onGetFrameByIndex(video_id: string, index: number) {
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


}
