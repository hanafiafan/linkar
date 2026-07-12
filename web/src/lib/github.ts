// Commit file ke repo GitHub via Contents API — dipakai publish (seed.json)
// dan upload (gambar), supaya perubahan sampai ke build Vercel.
// Aktif hanya jika env GITHUB_TOKEN + GITHUB_REPO diset; selain itu no-op.

const env = (k: string): string | undefined => (import.meta.env as any)?.[k] ?? process.env[k];

export function githubConfigured(): boolean {
  return !!(env('GITHUB_TOKEN') && env('GITHUB_REPO'));
}

export async function pushFileToGitHub(
  repoFilePath: string,
  content: Buffer,
  message: string
): Promise<'pushed' | null> {
  const token = env('GITHUB_TOKEN');
  const repo = env('GITHUB_REPO'); // contoh: "hanafiafan/LINKAR"
  if (!token || !repo) return null;

  const branch = env('GITHUB_BRANCH') || 'main';
  const api = `https://api.github.com/repos/${repo}/contents/${repoFilePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'linkar-cms',
  };

  // Ambil sha file saat ini (wajib untuk update file yang sudah ada)
  const getRes = await fetch(`${api}?ref=${branch}`, { headers });
  const sha = getRes.ok ? (await getRes.json()).sha : undefined;

  const putRes = await fetch(api, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message,
      content: content.toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    throw new Error(`GitHub menolak (${putRes.status}): ${(await putRes.text()).slice(0, 200)}`);
  }
  return 'pushed';
}
