/** Line-level diff (LCS) used by Compare PDFs. */
export function diffLines(textA, textB) {
  const a = String(textA || '').replace(/\r\n?/g, '\n').split('\n').map((s) => s.trimEnd());
  const b = String(textB || '').replace(/\r\n?/g, '\n').split('\n').map((s) => s.trimEnd());

  // Guard against pathological inputs: report them as fully replaced.
  if (a.length * b.length > 4_000_000) {
    return [
      ...a.map((text) => ({ type: 'removed', text })),
      ...b.map((text) => ({ type: 'added', text }))
    ];
  }

  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ type: 'equal', text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'removed', text: a[i] });
      i += 1;
    } else {
      rows.push({ type: 'added', text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) rows.push({ type: 'removed', text: a[i++] });
  while (j < b.length) rows.push({ type: 'added', text: b[j++] });

  return rows;
}

export function diffStats(rows) {
  return {
    added: rows.filter((r) => r.type === 'added').length,
    removed: rows.filter((r) => r.type === 'removed').length,
    same: rows.filter((r) => r.type === 'equal').length
  };
}
