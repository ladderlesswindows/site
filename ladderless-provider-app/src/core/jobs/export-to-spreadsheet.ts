import * as XLSX from 'xlsx';
import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SQLiteDatabase } from 'expo-sqlite';

export async function exportJobToSpreadsheet(jobId: string, db: SQLiteDatabase) {
  // Fetch job (including new time tracking fields)
  const job = await db.getFirstAsync<any>(
    `SELECT * FROM jobs WHERE id = ?`,
    [jobId]
  );

  if (!job) throw new Error('Job not found');

  // Fetch sections (walls)
  const sections = await db.getAllAsync<any>(
    `SELECT * FROM sections WHERE job_id = ? ORDER BY sort_order`,
    [jobId]
  );

  // Fetch final photos
  const finalPhotos = await db.getAllAsync<any>(
    `SELECT * FROM final_photos WHERE job_id = ? ORDER BY sort_order`,
    [jobId]
  );

  // Create workbook
  const wb = XLSX.utils.book_new();

  // === Sheet 1: Job Summary (tabular format as requested) ===
  const engagedDuration = job.engaged_start && job.end_time 
    ? Math.round((new Date(job.end_time).getTime() - new Date(job.engaged_start).getTime()) / 60000) 
    : null;

  const workDuration = job.work_start && job.end_time 
    ? Math.round((new Date(job.end_time).getTime() - new Date(job.work_start).getTime()) / 60000) 
    : null;

  const summaryHeaders = [
    'Clock In Time',
    'Address',
    'Begin Gig Time',
    'Walls',
    'Windows',
    'Screens',
    'Miles Driven',
    'Total Photos',
    'Safety Action Plan',
    'Engaged Duration (min)',
    'Gig Duration (min)',
    'Contact Person',
    'Address Notes',
    'Phone',
    'Email',
    'Mailing List',
    'How Found',
    'Client Rating (1-5)',
  ];

  let safetyDisplay = '';
  try {
    if (job.safety_checks) {
      const checks = JSON.parse(job.safety_checks);
      safetyDisplay = Array.isArray(checks) ? checks.join(', ') : job.safety_checks;
    }
  } catch (e) {
    safetyDisplay = job.safety_checks || '';
  }

  // Total photos = wall photos + final photos + before-clean screens photo + after-clean screens photo
  const beforeCleanPhoto = job.before_clean_photo_uri ? 1 : 0;
  const afterCleanPhoto = job.after_clean_photo_uri ? 1 : 0;
  const totalPhotos = sections.length + finalPhotos.length + beforeCleanPhoto + afterCleanPhoto;

  const summaryRow = [
    job.engaged_start ? new Date(job.engaged_start).toLocaleString() : '',
    job.address || '',
    job.work_start ? new Date(job.work_start).toLocaleString() : '',
    sections.length,
    job.total_windows || 0,
    job.total_screens || 0,
    job.miles_driven || 0,
    totalPhotos,
    safetyDisplay,
    engagedDuration ?? '',
    workDuration ?? '',
    job.contact_person || '',
    job.address_notes || '',
    job.phone || '',
    job.email || '',
    job.mailing_list === 1 ? 'Yes' : job.mailing_list === 0 ? 'No' : '',
    job.how_find || '',
    job.customer_rating ?? '',
  ];

  const summaryData = [summaryHeaders, summaryRow];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Style the header row
  const headerStyle = { 
    font: { bold: true, color: { rgb: "FFFFFF" } }, 
    fill: { fgColor: { rgb: "1E40AF" } } 
  };
  summaryHeaders.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (summarySheet[cellAddress]) {
      summarySheet[cellAddress].s = headerStyle;
    }
  });

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Job Summary');

  // === Sheet 2: Walls ===
  const wallsHeader = ['Wall #', 'Windows', 'Screens', 'Photo Filename'];
  const wallsRows = sections.map((s: any, index: number) => {
    const filename = s.photo_uri.split('/').pop() || s.photo_uri;
    return [index + 1, s.windows, s.screens, filename];
  });

  const wallsSheet = XLSX.utils.aoa_to_sheet([wallsHeader, ...wallsRows]);
  XLSX.utils.book_append_sheet(wb, wallsSheet, 'Walls');

  // === Sheet 3: Final Photos ===
  const finalHeader = ['Photo #', 'Filename'];
  const finalRows = finalPhotos.map((p: any, index: number) => {
    const filename = p.photo_uri.split('/').pop() || p.photo_uri;
    return [index + 1, filename];
  });

  const finalSheet = XLSX.utils.aoa_to_sheet([finalHeader, ...finalRows]);
  XLSX.utils.book_append_sheet(wb, finalSheet, 'Final Photos');

  // Generate filename
  const safeAddress = (job.address || 'Job')
    .replace(/[^a-z0-9]/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  const date = new Date().toISOString().split('T')[0];
  const filename = `Ladderless - ${safeAddress} - ${date}.xlsx`;

  // Save file
  const outputDir = new Directory(Paths.document, 'exports');
  await outputDir.create({ intermediates: true, idempotent: true });

  const filePath = `${outputDir.uri}/${filename}`;
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  // Convert base64 to Uint8Array because the new File.write() expects binary content for .xlsx
  const bytes = Uint8Array.from(atob(wbout), (c) => c.charCodeAt(0));

  const file = new File(filePath);
  await file.write(bytes);

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Job Spreadsheet',
      UTI: 'com.microsoft.excel.xlsx',
    });
  } else {
    alert(`Spreadsheet saved to:\n${filePath}`);
  }

  return filePath;
}

/**
 * Simple export of ALL completed/past jobs to a single CSV file.
 * One row per job with the key bookkeeping fields.
 * CSV is easy to open in any spreadsheet app (Numbers, Excel, Google Sheets).
 *
 * Does NOT clear data — caller decides when/how to clear after successful export.
 */
export async function exportAllPastJobsToCSV(db: SQLiteDatabase): Promise<string> {
  // Load all completed jobs (most recent first)
  const jobs = await db.getAllAsync<any>(
    `SELECT * FROM jobs WHERE status = 'completed' ORDER BY completed_at DESC`
  );

  if (!jobs || jobs.length === 0) {
    throw new Error('No past jobs to export');
  }

  // Flat job-level columns (keeps the CSV simple and useful)
  const headers = [
    'Completed At',
    'Address',
    'Customer Name',
    'Walls',
    'Windows',
    'Screens',
    'Miles Driven',
    'Engaged Duration (min)',
    'Gig Duration (min)',
    'Safety Action Plan',
    'Total Photos',
    'Notes',
    'Contact Person',
    'Address Notes',
    'Phone',
    'Email',
    'Mailing List',
    'How Found',
    'Client Rating (1-5)',
  ];

  const dataRows: string[][] = [];

  for (const job of jobs) {
    const jobId = job.id;

    // Wall count (each section = one wall photo + counts)
    const wallCountRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sections WHERE job_id = ?`,
      [jobId]
    );
    const wallCount = wallCountRow?.count ?? 0;

    // Final photo count
    const finalCountRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM final_photos WHERE job_id = ?`,
      [jobId]
    );
    const finalCount = finalCountRow?.count ?? 0;

    const before = job.before_clean_photo_uri ? 1 : 0;
    const after = job.after_clean_photo_uri ? 1 : 0;
    const totalPhotos = wallCount + finalCount + before + after;

    // Durations in minutes (same logic as single-job export)
    const engagedMin =
      job.engaged_start && job.end_time
        ? Math.round((new Date(job.end_time).getTime() - new Date(job.engaged_start).getTime()) / 60000)
        : '';
    const gigMin =
      job.work_start && job.end_time
        ? Math.round((new Date(job.end_time).getTime() - new Date(job.work_start).getTime()) / 60000)
        : '';

    // Safety (JSON array -> semicolon separated for CSV friendliness)
    let safety = '';
    try {
      if (job.safety_checks) {
        const checks = JSON.parse(job.safety_checks);
        safety = Array.isArray(checks) ? checks.join('; ') : String(job.safety_checks);
      }
    } catch {
      safety = job.safety_checks || '';
    }

    const completedStr = job.completed_at ? new Date(job.completed_at).toLocaleString() : '';

    dataRows.push([
      completedStr,
      job.address || '',
      job.customer_name || '',
      String(wallCount),
      String(job.total_windows || 0),
      String(job.total_screens || 0),
      String(job.miles_driven || 0),
      String(engagedMin),
      String(gigMin),
      safety,
      String(totalPhotos),
      job.final_notes || '',
      job.contact_person || '',
      job.address_notes || '',
      job.phone || '',
      job.email || '',
      job.mailing_list === 1 ? 'Yes' : (job.mailing_list === 0 ? 'No' : ''),
      job.how_find || '',
      job.customer_rating ?? '',
    ]);
  }

  // Minimal CSV escaping (handles commas, quotes, newlines)
  const escapeCSV = (value: string | number): string => {
    const s = String(value ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const csv = [
    headers.map(escapeCSV).join(','),
    ...dataRows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  // Write to exports folder
  const outputDir = new Directory(Paths.document, 'exports');
  await outputDir.create({ intermediates: true, idempotent: true });

  const date = new Date().toISOString().split('T')[0];
  const filename = `Ladderless-Past-Jobs-${date}.csv`;
  const filePath = `${outputDir.uri}/${filename}`;

  const file = new File(filePath);
  // Write text content (Uint8Array for reliability across platforms)
  await file.write(new TextEncoder().encode(csv));

  // Share as CSV
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Past Jobs CSV',
    });
  } else {
    alert(`CSV saved to:\n${filePath}`);
  }

  return filePath;
}

