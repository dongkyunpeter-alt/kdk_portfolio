# 강동균 포트폴리오

웹 퍼블리셔 강동균의 메인 포트폴리오와 풀무원 웹 리뉴얼 프로젝트 상세 페이지입니다.

## 구성

- `src/App.jsx`: 공통 헤더·푸터와 페이지 구성을 담당하는 React 앱
- `src/pages`: 메인·프로젝트 상세 JSX 페이지 컴포넌트
- `src/components`: 상세 캐러셀 등 재사용 UI 컴포넌트
- `src/data`: 프로젝트 카드 데이터
- `index.html`, `pulmuone.html`: 기존 주소를 유지하는 Vite 엔트리
- `assets/css`: 공통·메인·프로젝트 스타일
- `assets/js/react-app.js`: 정적 호스팅용 React 프로덕션 번들
- `evidence`, `reports`: 구현 기준과 측정 자료

## 실행

Node.js 20.19 이상 또는 22.12 이상에서 의존성을 설치합니다.

```powershell
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:4392`로 접속합니다.

## 검증

다음 명령은 게임 물리, 복사 성공·실패 처리, 맨 위로 이동, 이미지·페이지별 로딩 경로를 Node 테스트로 확인합니다. 브라우저 레이아웃 검사는 별도로 진행합니다.

```powershell
npm test
```

## 빌드와 초기 로딩

`npm run build:app`은 파일 직접 열기도 지원하는 정적 번들 두 개를 생성합니다.

- 메인: `src/main.jsx` → `assets/js/react-app.js`
- 상세: `src/pulmuone.jsx` → `assets/js/pulmuone-app.js`

`npm run build`는 두 번들을 포함한 배포본을 `dist`에 생성합니다. 두 페이지를 함께 배포해야 합니다.

프로필 사진은 무손실 WebP를 우선 로딩하고, 프로젝트·캐러셀 이미지는 지연 로딩합니다. PNG 원본은 보존합니다. 이미지 재생성은 sharp가 설치된 환경에서 `node scripts/optimize-images.cjs`로 실행하며, 별도 설치 경로는 `SHARP_MODULE` 환경변수로 지정할 수 있습니다. 변환 시 해상도·알파·보이는 픽셀의 동일성을 검사합니다.

## 모션 접근성

별도 설정 버튼 없이 기기의 `prefers-reduced-motion`을 따르며, 페이지를 연 상태의 설정 변경도 반영합니다. 모션 감소 시 프로젝트는 정적 목록으로 표시하고 Lenis·ScrollSmoother, 마그네틱 버튼, 사진 기울기, 로고·푸터 효과, 커서 몽이, 장식 CSS 애니메이션을 중지합니다. 캐러셀은 즉시 전환하며 링크·키보드 탐색·게임 직접 조작은 유지합니다. 일반 모션 설정에서는 기존 효과가 복원됩니다.

## 주요 구현 기준

- React와 Vite 기반 멀티 페이지 구성
- 메뉴·게임·프로젝트 해금·캐러셀을 React 상태와 훅으로 관리
- IBM Plex Sans KR와 IBM Plex Mono로 타이포그래피 통일
- 공통 헤더·푸터 컴포넌트 공유
- 키보드와 터치 방향키를 지원하는 프로젝트 해금 게임
- 반응형 레이아웃과 모션 감소 설정 지원
- Lighthouse 및 에셋 최적화 결과 기록
