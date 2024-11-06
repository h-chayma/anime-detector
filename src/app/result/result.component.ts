import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SearchService } from '../service/search.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  @ViewChild('videoPlayer')
  videoPlayer!: ElementRef;

  @ViewChild('bigCard')
  bigCard!: ElementRef;

  scrollToBigCard() {
    this.bigCard.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  searchResult: any;
  selectedResult: any;
  uploadedImageUrl!: string | null;
  animeDetails: any;

  constructor(private searchService: SearchService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const searchData = this.searchService.getSearchResult();
    if (!searchData || !searchData.result || searchData.result.length === 0) {
      this.router.navigate(['/']);
      return;
    }
    this.searchResult = searchData.result;
    console.log(this.searchResult);
    this.selectedResult = this.searchResult[0];
    this.getAnimeDetails(this.selectedResult.anilist.idMal);
    this.uploadedImageUrl = this.searchService.getUploadedImageUrl();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedTime =
      (hours < 10 ? '0' : '') + hours + ':' +
      (minutes < 10 ? '0' : '') + minutes + ':' +
      (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    return formattedTime;
  }

  selectResult(result: any) {
    this.selectedResult = result;
    this.getAnimeDetails(this.selectedResult.anilist.idMal);
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.src = this.selectedResult.video;
      this.videoPlayer.nativeElement.controls = true;
    }
  }

  getAnimeDetails(id: string) {
    this.searchService.getAnime(id).subscribe((result) => {
      this.animeDetails = result.data;
    });
  }
}
