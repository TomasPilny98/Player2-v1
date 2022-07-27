import { TestBed } from '@angular/core/testing';

import { DiagnosticVideoControlService } from './diagnostic-video-control.service';

describe('DiagnosticVideoControlService', () => {
  let service: DiagnosticVideoControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagnosticVideoControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
