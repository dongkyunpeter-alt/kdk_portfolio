export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// 기기 설정만 사용합니다. 별도 버튼이나 localStorage 설정은 만들지 않습니다.
export function createMotionPreference(matchMedia) {
  const media = matchMedia?.(REDUCED_MOTION_QUERY);
  return {
    getSnapshot: () => media?.matches ?? false,
    subscribe: callback => {
      if (!media) return () => {};
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
  };
}

export const motionPreference = createMotionPreference(globalThis.matchMedia?.bind(globalThis));
