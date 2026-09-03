// 권한 거부나 Clipboard API 미지원도 실패로 돌려줘 성공 메시지와 구분합니다.
export async function copyText(text, clipboard = globalThis.navigator?.clipboard) {
  try {
    if (!clipboard?.writeText) return false;
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function scrollPageToTop({ smoother, reducedMotion, scrollTo }) {
  if (smoother) smoother.scrollTo(0, !reducedMotion);
  else scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
}
