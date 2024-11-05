import { Component } from '@angular/core';
import { SearchService } from '../service/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  file: File | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private searchService: SearchService, private router: Router) { }

  onFileChange(event: any) {
    this.errorMessage = null;
    const input = event.target as HTMLInputElement;
    const fileList: FileList | null = input.files;

    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      const formData = new FormData();
      formData.append('image', file, file.name);
      const imageUrl = URL.createObjectURL(file);
      this.loading = true;

      this.searchService.searchImageAndResize(file).subscribe((result) => {
        this.searchService.setSearchResult(result);
        this.router.navigate(['/result', imageUrl]);
      }, (error) => {
        console.error('Error during search:', error);
      },
        () => {
          this.loading = false;
        });

      const fileForm: HTMLFormElement | null = document.querySelector('#fileForm');
      if (fileForm) {
        fileForm.reset();
      }
    } else {
      this.errorMessage = 'No file selected. Please choose an image file to upload.';
    }
  }
}