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

다음 명령은 로컬 서버를 자동으로 실행한 뒤 데스크톱·모바일 레이아웃, 게임 상태, 공통 헤더·푸터, 프로젝트 상세 페이지를 Playwright로 확인합니다.

```powershell
npm test
```

## 주요 구현 기준

- React와 Vite 기반 멀티 페이지 구성
- 메뉴·게임·프로젝트 해금·캐러셀을 React 상태와 훅으로 관리
- IBM Plex Sans KR와 IBM Plex Mono로 타이포그래피 통일
- 공통 헤더·푸터 컴포넌트 공유
- 키보드와 터치 방향키를 지원하는 프로젝트 해금 게임
- 반응형 레이아웃과 모션 감소 설정 지원
- Lighthouse 및 에셋 최적화 결과 기록
