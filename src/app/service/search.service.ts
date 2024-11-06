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
  private uploadedImageUrl: string | null = null;

  constructor(private http: HttpClient) { }

  // Public method to handle the image search and resizing
  searchImageAndResize(file: File): Observable<any> {
    return new Observable<any>(observer => {
      this.resizeImage(file)
        .then(resizedBlob => {
          const formData = new FormData();
          formData.append('image', resizedBlob, file.name);
          return this.searchImage(formData);
        })
        .then(result => observer.next(result))
        .catch(error => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  // Resize the image and return as Blob
  private resizeImage(file: File): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const image = new Image();
        image.onload = () => {
          const { width, height } = this.calculateDimensions(image);
          const canvas = this.createCanvas(width, height);
          const context = canvas.getContext('2d');
          context?.drawImage(image, 0, 0, width, height);

          canvas.toBlob(
            blob => (blob ? resolve(blob) : reject('Error resizing image')),
            'image/jpeg'
          );
        };
        image.onerror = () => reject('Image loading failed');
        image.src = event.target.result;
      };

      reader.onerror = () => reject('File reading failed');
      reader.readAsDataURL(file);
    });
  }

  // Calculate image dimensions based on max width and height
  private calculateDimensions(image: HTMLImageElement): { width: number; height: number } {
    let { width, height } = image;
    if (width > height && width > this.MAX_WIDTH) {
      height *= this.MAX_WIDTH / width;
      width = this.MAX_WIDTH;
    } else if (height > this.MAX_HEIGHT) {
      width *= this.MAX_HEIGHT / height;
      height = this.MAX_HEIGHT;
    }
    return { width, height };
  }

  // Create canvas for resizing image
  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // Search image using the API
  private searchImage(formData: FormData): Promise<any> {
    const url = `${this.apiUrl}?cutBorders&anilistInfo`;
    return this.http.post(url, formData).pipe(
      catchError((error) => {
        console.error('Error in searchImage API call:', error);
        return throwError('Error during image search. Please try again later.');
      })
    ).toPromise();
  }

  // Fetch anime details by ID
  getAnime(animeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiAnimeUrl}/anime/${animeId}`);
  }

  // Set the search result
  setSearchResult(result: any): void {
    this.searchResult = result;
  }

  // Get the search result
  getSearchResult(): any {
    return this.searchResult;
  }

  // Set the uploaded image URL
  setUploadedImageUrl(url: string): void {
    this.uploadedImageUrl = url;
  }

  // Get the uploaded image URL
  getUploadedImageUrl(): string | null {
    return this.uploadedImageUrl;
  }
}
