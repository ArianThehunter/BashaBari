<?php

namespace App\Services\Storage;

use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class DocumentStorageService
{
    /**
     * Allowed document MIME types.
     */
    protected const ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];

    /**
     * Maximum file size in kilobytes (10 MB).
     */
    protected const MAX_FILE_SIZE_KB = 10240;

    /**
     * Securely store a tenant NID or premises verification document.
     *
     * @param  UploadedFile  $file
     * @param  string  $organizationId
     * @param  string  $category ('nid_front', 'nid_back', 'dmp_form', 'meter_photo', 'lease_agreement')
     * @return array{path: string, url: string, filename: string, mime: string, size: int}
     */
    public function storeDocument(UploadedFile $file, string $organizationId, string $category = 'general'): array
    {
        $mime = $file->getMimeType();
        if (! array_key_exists($mime, self::ALLOWED_MIMES)) {
            throw new InvalidArgumentException("Invalid file type: {$mime}. Only PDF, JPG, PNG, and WebP are permitted.");
        }

        if ($file->getSize() > (self::MAX_FILE_SIZE_KB * 1024)) {
            throw new InvalidArgumentException('File size exceeds the maximum permitted limit of 10 MB.');
        }

        $extension = self::ALLOWED_MIMES[$mime];
        $randomHash = Str::random(32);
        $filename = "{$category}_{$randomHash}.{$extension}";

        // Partition by organization for secure tenant isolation
        $storagePath = "organizations/{$organizationId}/{$category}/{$filename}";

        Storage::disk('local')->put($storagePath, file_get_contents($file->getRealPath()));

        return [
            'path' => $storagePath,
            'filename' => $filename,
            'mime' => $mime,
            'size' => $file->getSize(),
            'uploaded_at' => Carbon::now('Asia/Dhaka')->toIso8601String(),
        ];
    }

    /**
     * Generate a temporary signed download URL for private documents.
     */
    public function getTemporaryUrl(string $path, int $expirationMinutes = 30): string
    {
        if (config('filesystems.default') === 's3') {
            return Storage::disk('s3')->temporaryUrl($path, now()->addMinutes($expirationMinutes));
        }

        // Fallback for local storage (generates local route)
        return url("/api/v1/documents/download?path=".urlencode($path));
    }

    /**
     * Delete a stored document.
     */
    public function deleteDocument(string $path): bool
    {
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->delete($path);
        }

        return false;
    }
}
