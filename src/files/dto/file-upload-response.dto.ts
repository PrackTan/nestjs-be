export class FileUploadResponseDto {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  uploadedAt: Date;
}

export class MultipleFileUploadResponseDto {
  success: boolean;
  message: string;
  data: FileUploadResponseDto[];
  totalFiles: number;
}

export class SingleFileUploadResponseDto {
  success: boolean;
  message: string;
  data: FileUploadResponseDto;
}
