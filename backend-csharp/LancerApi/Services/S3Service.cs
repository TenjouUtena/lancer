using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;

namespace LancerApi.Services
{
    public class S3Service
    {
        private readonly AmazonS3Client _s3Client;
        private readonly string _bucketName;

        public S3Service(IConfiguration configuration)
        {
            var region = RegionEndpoint.GetBySystemName(configuration["AWS:Region"]);
            _s3Client = new AmazonS3Client(region);
            _bucketName = configuration["AWS:S3BucketName"];
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string key, string? contentType = null)
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType ?? GetContentType(key)
            };

            await _s3Client.PutObjectAsync(putRequest);
            return key;
        }

        public async Task<string> UploadPsdFileAsync(Stream fileStream, string key, string fileName)
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = "application/octet-stream",
                Metadata = 
                {
                    ["original-filename"] = fileName,
                    ["file-type"] = "psd"
                }
            };

            await _s3Client.PutObjectAsync(putRequest);
            return key;
        }

        public async Task DeleteFileAsync(string key)
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest);
        }

        public string GetPresignedUrl(string key, TimeSpan expiry)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Expires = DateTime.UtcNow.Add(expiry)
            };

            return _s3Client.GetPreSignedURL(request);
        }

        private string GetContentType(string key)
        {
            var extension = Path.GetExtension(key).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".psd" => "application/octet-stream",
                _ => "application/octet-stream"
            };
        }
    }
}
