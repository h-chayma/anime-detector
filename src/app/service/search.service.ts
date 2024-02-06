import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'https://api.trace.moe/search';
  private apiAnimeUrl = 'https://api.jikan.moe/v4';
  private searchResult: any;

  constructor(private http: HttpClient) { }

  searchImageAndResize(file: File): Observable<any> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const MAX_WIDTH = 800; 
    const MAX_HEIGHT = 600;

    const image = new Image();
    const reader = new FileReader();

    return new Observable<any>(observer => {
      reader.onload = (event: any) => {
        image.onload = () => {
          let width = image.width;
          let height = image.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          context?.drawImage(image, 0, 0, width, height);
          canvas.toBlob(blob => {
            if (blob) {
              const formData = new FormData();
              formData.append('image', blob, file.name);
                            this.searchImage(formData).subscribe(
                result => observer.next(result),
                error => observer.error(error),
                () => observer.complete()
              );
            } else {
              observer.error('Error resizing image');
            }
          }, 'image/jpeg'); 
        };
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  searchImage(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}?cutBorders&anilistInfo`;
    return this.http.post(url, formData);
  }

  getAnime(animeId: string): Observable<any> {
    return this.http.get<any>(this.apiAnimeUrl + "/anime/" + animeId);
  }

  setSearchResult(result: any) {
    this.searchResult = result;
  }

  getSearchResult() {
    return this.searchResult;
  }
}

