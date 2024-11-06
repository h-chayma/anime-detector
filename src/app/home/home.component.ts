import { Component } from '@angular/core';
import { SearchService } from '../service/search.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
      this.handleFile(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please choose an image file to upload.',
        confirmButtonText: 'OK',
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('dragging');
  }

  onDragLeave(event: DragEvent) {
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragging');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragging');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file: File = files[0];
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    this.loading = true;

    const allowedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    if (!allowedFormats.includes(file.type)) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Invalid file format',
        text: 'Please upload an image file (PNG, JPG, JPEG, GIF).',
        confirmButtonText: 'OK',
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    this.searchService.setUploadedImageUrl(imageUrl);
    this.searchService.searchImageAndResize(file).subscribe(
      (result) => {
        this.searchService.setSearchResult(result);
        this.router.navigate(['/result']);
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error Processing Image',
          text: 'Please try again.',
          confirmButtonText: 'OK',
        });

      },
      () => {
        this.loading = false;
      }
    );
  }
}
