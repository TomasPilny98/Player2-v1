import { TestBed } from '@angular/core/testing';

import { PreviewLoadingService } from './preview-loading.service';

describe('PreviewLoadingService', () => {
  let service: PreviewLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviewLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
