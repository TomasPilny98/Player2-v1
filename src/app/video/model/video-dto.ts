import {Byte} from "@angular/compiler/src/util";

export class VideoDto {

  id: number
  device_id: string
  record_mode: string
  timestamp: string
  frame_rate: number
  images_count: number
  origin: string
  trigger_timestamp: string
  signal_request: string
  preview: string


  constructor(id: number, device_id: string, record_mode: string, timestamp: string, frame_rate: number, images_count: number, origin: string, trigger_timestamp: string, signal_request: string, preview: string) {
    this.id = id;
    this.device_id = device_id;
    this.record_mode = record_mode;
    this.timestamp = timestamp;
    this.frame_rate = frame_rate;
    this.images_count = images_count;
    this.origin = origin;
    this.trigger_timestamp = trigger_timestamp;
    this.signal_request = signal_request;
    this.preview = preview;
  }
}
