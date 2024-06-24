import { Component, ElementRef, ViewChild } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-img-selector',
  standalone: false,
  templateUrl: './img-selector.component.html',
  styleUrl: './img-selector.component.css'
})
export class ImgSelectorComponent {

  @ViewChild('selectedImage') selectedImage!: ElementRef<HTMLImageElement>;
  @ViewChild('gridLines') gridLines!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imgSrc: string | ArrayBuffer | null = null;
  nRows: number = 5;
  nColumns: number = 5;
  file?: File

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.file = event.dataTransfer?.files[0];
    if (this.file) {
      this.loadFile();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0];
    if (this.file) {
      this.loadFile();
    }
  }

  loadFile() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc = e.target?.result!;
    };
    reader.readAsDataURL(this.file!);
  }

  reset() {
    this.imgSrc = null;
    this.nRows = 5;
    this.nColumns = 5;
    this.file = undefined
    this.fileInput.nativeElement.value = ''
  }

  updateGrid() {
    if (!this.selectedImage.nativeElement.complete) {
      return;
    }

    const img = this.selectedImage.nativeElement;
    const canvas = this.gridLines.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const imgWidth = img.width;
    const imgHeight = img.height;
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.clearRect(0, 0, imgWidth, imgHeight);

    for (let i = 1; i < this.nRows; i++) {
      const y = (imgHeight / this.nRows) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(imgWidth, y);
    }

    for (let i = 1; i < this.nColumns; i++) {
      const x = (imgWidth / this.nColumns) * i;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, imgHeight);
    }

    ctx.strokeStyle = 'red';
    ctx.stroke();
  }

  async downloadImages() {
    const img = this.selectedImage.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const imgWidth = img.width;
    const imgHeight = img.height;
    const cellWidth = imgWidth / this.nColumns;
    const cellHeight = imgHeight / this.nRows;

    const imgExtension = this.file!.name.split('.').pop();
    const zip = new JSZip();

    const createBlob = (x: number, y: number): Promise<Blob> => {
      return new Promise((resolve) => {
        canvas.width = cellWidth;
        canvas.height = cellHeight;
        ctx.drawImage(img, x * cellWidth, y * cellHeight, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        canvas.toBlob(blob => resolve(blob!));
      });
    };

    for (let y = 0; y < this.nRows; y++) {
      for (let x = 0; x < this.nColumns; x++) {
        const blob = await createBlob(x, y);
        zip.file(`${x}x${y}.${imgExtension}`, blob);
      }
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'images.zip');
    });
  }
}

