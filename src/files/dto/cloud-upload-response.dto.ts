export class CloudUploadResponseDto {
  provider: 'cloudinary' | 'aws-s3';
  publicId: string;
  url: string;
  secureUrl: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export class CloudUploadSingleResponseDto {
  success: boolean;
  message: string;
  provider: 'cloudinary' | 'aws-s3';
  data: CloudUploadResponseDto;
}

export class CloudUploadMultipleResponseDto {
  success: boolean;
  message: string;
  provider: 'cloudinary' | 'aws-s3';
  data: CloudUploadResponseDto[];
  totalFiles: number;
}
