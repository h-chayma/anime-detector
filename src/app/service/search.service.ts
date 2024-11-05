import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly MAX_WIDTH = 800;
  private readonly MAX_HEIGHT = 600;
  private readonly apiUrl = 'https://api.trace.moe/search';
  private readonly apiAnimeUrl = 'https://api.jikan.moe/v4';
  private searchResult: any;

  constructor(private http: HttpClient) { }

  searchImageAndResize(file: File): Observable<any> {
    const reader = new FileReader();

    return new Observable<any>(observer => {
      reader.onload = (event: any) => {
        const image = new Image();
        image.onload = () => {
          this.resizeImage(image, this.MAX_WIDTH, this.MAX_HEIGHT).subscribe({
            next: (resizedBlob) => {
              const formData = new FormData();
              formData.append('image', resizedBlob, file.name);
              this.searchImage(formData).subscribe(
                result => observer.next(result),
                error => observer.error(error),
                () => observer.complete()
              );
            },
            error: error => observer.error(error)
          });
        };
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  private resizeImage(image: HTMLImageElement, maxWidth: number, maxHeight: number): Observable<Blob> {
    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      let { width, height } = image;

      if (width > height && width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      } else if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      context?.drawImage(image, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (blob) observer.next(blob);
        else observer.error('Error resizing image');
        observer.complete();
      }, 'image/jpeg');
    });
  }

  searchImage(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}?cutBorders&anilistInfo`;
    return this.http.post(url, formData).pipe(
      catchError((error) => {
        console.error('Error in searchImage API call:', error);
        return throwError('Error during image search. Please try again later.');
      })
    );
  }

  getAnime(animeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiAnimeUrl}/anime/${animeId}`);
  }

  setSearchResult(result: any): void {
    this.searchResult = result;
  }

  getSearchResult(): any {
    return this.searchResult;
  }
}

