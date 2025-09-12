# Cloud Upload Setup Guide

## 📋 Required Packages

First, install the required packages:

```bash
npm install cloudinary aws-sdk @aws-sdk/client-s3 @aws-sdk/lib-storage
```

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# Base URL
BASE_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## 🚀 Enable Cloud Upload

After installing packages and setting env variables:

1. **Enable Cloudinary**: Uncomment the Cloudinary code in `cloud-upload.service.ts`
2. **Enable AWS S3**: Uncomment the AWS S3 code in `cloud-upload.service.ts`

## 📡 Available Endpoints

### Local Upload

- `POST /files/upload` - Upload single file locally
- `POST /files/upload-multiple` - Upload multiple files locally

### Cloudinary Upload

- `POST /files/upload-cloudinary` - Upload single file to Cloudinary
- `POST /files/upload-cloudinary-multiple` - Upload multiple files to Cloudinary

### AWS S3 Upload

- `POST /files/upload-s3` - Upload single file to AWS S3
- `POST /files/upload-s3-multiple` - Upload multiple files to AWS S3

### File Management

- `GET /files/serve/:filename` - Serve local files
- `GET /files/:id` - Get file info
- `DELETE /files/:filename` - Delete local file

## 📝 Usage Examples

### Upload to Cloudinary

```bash
curl -X POST \
  http://localhost:3000/files/upload-cloudinary \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/file.jpg'
```

### Upload to AWS S3

```bash
curl -X POST \
  http://localhost:3000/files/upload-s3 \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/file.jpg'
```

## 🔒 File Limits

| Provider   | Max File Size | Max Files | Supported Types           |
| ---------- | ------------- | --------- | ------------------------- |
| Local      | 5MB           | 10        | Images, PDF, Documents    |
| Cloudinary | 10MB          | 10        | Images, Videos, Documents |
| AWS S3     | 50MB          | 20        | All types + Archives      |

## 📋 Response Format

```json
{
  "success": true,
  "message": "File uploaded to Cloudinary successfully",
  "provider": "cloudinary",
  "data": {
    "provider": "cloudinary",
    "publicId": "uploads/1694123456789-photo.jpg",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/1694123456789-photo.jpg",
    "secureUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/1694123456789-photo.jpg",
    "originalName": "photo.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadedAt": "2023-09-08T10:30:45.123Z"
  }
}
```
