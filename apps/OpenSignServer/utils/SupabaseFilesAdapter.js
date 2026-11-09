/**
 * Supabase Storage FilesAdapter for Parse Server / OpenSign
 */
export default class SupabaseFilesAdapter {
  constructor(options = {}) {
    this.supabaseUrl = (options.url || process.env.SUPABASE_URL || '').replace(/\/$/, '');
    this.bucket = options.bucket || process.env.SUPABASE_STORAGE_BUCKET || 'hrms-documents';
    this.serviceRoleKey =
      options.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new Error(
        'SupabaseFilesAdapter requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }
  }

  getHeaders(contentType = 'application/octet-stream') {
    return {
      Authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      'Content-Type': contentType,
    };
  }

  /**
   * Upload file to Supabase Storage
   */
  async createFile(filename, data, contentType = 'application/pdf') {
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${encodeURIComponent(
      cleanFilename
    )}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHeaders(contentType),
        'x-upsert': 'true',
      },
      body: data,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to upload file to Supabase Storage: ${response.status} ${errText}`
      );
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(filename) {
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = `${this.supabaseUrl}/storage/v1/object/${this.bucket}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify({ prefixes: [cleanFilename] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to delete file from Supabase Storage: ${response.status} ${errText}`
      );
    }
  }

  /**
   * Download file data as Buffer
   */
  async getFileData(filename) {
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = `${this.supabaseUrl}/storage/v1/object/authenticated/${this.bucket}/${encodeURIComponent(
      cleanFilename
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to get file from Supabase Storage: ${response.status} ${errText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Return public file URL
   */
  getFileLocation(config, filename) {
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${cleanFilename}`;
  }

  /**
   * Generate temporary signed download URL
   */
  async signedUrl(filename) {
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = `${this.supabaseUrl}/storage/v1/object/sign/${this.bucket}/${encodeURIComponent(
      cleanFilename
    )}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify({ expiresIn: 900 }),
    });

    if (!response.ok) {
      return this.getFileLocation(null, filename);
    }

    const data = await response.json();
    return `${this.supabaseUrl}/storage/v1${data.signedURL}`;
  }
}

