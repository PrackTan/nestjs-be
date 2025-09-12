import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Cloudinary imports
// import { v2 as cloudinary } from 'cloudinary';

// AWS S3 imports
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';

export interface CloudUploadResponse {
  provider: 'cloudinary' | 'aws-s3';
  publicId: string;
  url: string;
  secureUrl: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

@Injectable()
export class CloudUploadService {
  // private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    // this.initializeCloudinary();
    // this.initializeS3();
  }

  // private initializeCloudinary() {
  //   cloudinary.config({
  //     cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
  //     api_key: this.configService.get('CLOUDINARY_API_KEY'),
  //     api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
  //   });
  // }

  // private initializeS3() {
  //   this.s3Client = new S3Client({
  //     region: this.configService.get('AWS_REGION'),
  //     credentials: {
  //       accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
  //       secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
  //     },
  //   });
  // }

  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudUploadResponse> {
    try {
      // Uncomment khi đã cài cloudinary
      /*
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'uploads', // folder trong cloudinary
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) throw error;
          return result;
        }
      );

      // Upload buffer
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'uploads',
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException('Cloudinary upload failed: ' + error.message));
            } else {
              resolve({
                provider: 'cloudinary',
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                uploadedAt: new Date(),
              });
            }
          }
        );
        uploadStream.end(file.buffer);
      });
      */

      // Mock response for now
      return {
        provider: 'cloudinary',
        publicId: `uploads/${Date.now()}-${file.originalname}`,
        url: `https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/${Date.now()}-${file.originalname}`,
        secureUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(
        'Cloudinary upload failed: ' + error.message,
      );
    }
  }

  async uploadToS3(file: Express.Multer.File): Promise<CloudUploadResponse> {
    try {
      // Uncomment khi đã cài aws-sdk
      /*
      const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
      const key = `uploads/${Date.now()}-${file.originalname}`;

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // hoặc 'private' tùy need
      };

      const upload = new Upload({
        client: this.s3Client,
        params: uploadParams,
      });

      const result = await upload.done();
      const region = this.configService.get('AWS_REGION');
      const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        provider: 'aws-s3',
        publicId: key,
        url: url,
        secureUrl: url,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };
      */

      // Mock response for now
      const key = `uploads/${Date.now()}-${file.originalname}`;
      const bucketName = 'your-bucket-name';
      const region = 'us-east-1';
      const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        provider: 'aws-s3',
        publicId: key,
        url: url,
        secureUrl: url,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new BadRequestException('S3 upload failed: ' + error.message);
    }
  }

  async uploadMultipleToCloudinary(
    files: Express.Multer.File[],
  ): Promise<CloudUploadResponse[]> {
    const results: CloudUploadResponse[] = [];

    for (const file of files) {
      const result = await this.uploadToCloudinary(file);
      results.push(result);
    }

    return results;
  }

  async uploadMultipleToS3(
    files: Express.Multer.File[],
  ): Promise<CloudUploadResponse[]> {
    const results: CloudUploadResponse[] = [];

    for (const file of files) {
      const result = await this.uploadToS3(file);
      results.push(result);
    }

    return results;
  }
}
